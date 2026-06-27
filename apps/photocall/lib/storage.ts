import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
	region: process.env.S3_REGION ?? "auto",
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
	},
	forcePathStyle: true, // Required for S3-compatible services like MinIO, R2
});

const BUCKET = process.env.S3_BUCKET ?? "photocall";

function generateKey(prefix: string, extension = "bin"): string {
	const id = crypto.randomUUID();
	return `${prefix}/${id}.${extension}`;
}

/** Generate a presigned PUT URL for direct client upload */
export async function generateUploadUrl(
	prefix: string,
	contentType: string,
): Promise<{ uploadUrl: string; key: string }> {
	const ext = contentType.split("/")[1] ?? "bin";
	const key = generateKey(prefix, ext);

	const command = new PutObjectCommand({
		Bucket: BUCKET,
		Key: key,
		ContentType: contentType,
	});

	const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
	return { uploadUrl, key };
}

/**
 * Generate a presigned PUT URL for a guest album upload.
 *
 * Hardened vs {@link generateUploadUrl}: both the `Content-Type` and the exact
 * `Content-Length` are baked into the signature, so the client cannot upload a
 * different type or a larger object than declared. Callers must validate the
 * declared size against a maximum *before* requesting the URL.
 */
export async function generateGuestUploadUrl(
	contentType: string,
	contentLength: number,
): Promise<{ uploadUrl: string; key: string }> {
	const ext = contentType.split("/")[1] ?? "bin";
	const key = generateKey("guest", ext);

	const command = new PutObjectCommand({
		Bucket: BUCKET,
		Key: key,
		ContentType: contentType,
		ContentLength: contentLength,
	});

	const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
	return { uploadUrl, key };
}

/** Returns the byte size of a stored object (used to confirm guest uploads). */
export async function getObjectSize(key: string): Promise<number | null> {
	try {
		const result = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
		return result.ContentLength ?? null;
	} catch {
		return null;
	}
}

/**
 * Returns the size and stored `Content-Type` of an object, or null when it's
 * absent. The content type is read from storage (not the client) so guest-upload
 * confirmation can decide image-vs-video limits from what actually landed.
 */
export async function getObjectMetadata(
	key: string,
): Promise<{ sizeBytes: number; contentType: string | null } | null> {
	try {
		const result = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
		if (result.ContentLength === undefined) return null;
		return { sizeBytes: result.ContentLength, contentType: result.ContentType ?? null };
	} catch {
		return null;
	}
}

/**
 * Generate a presigned GET URL for reading a file.
 *
 * Pass `downloadFilename` to force a browser download: the URL carries a
 * `Content-Disposition: attachment; filename="..."` header, so clicking it
 * downloads the object directly from storage (cross-origin, no `fetch`, no CORS)
 * under the given name. Omit it for the default inline behaviour (e.g. `<img>`).
 */
export async function getFileUrl(
	key: string,
	opts?: { downloadFilename?: string },
): Promise<string> {
	// If a public URL base is configured, use it directly. Public URLs can't
	// carry a presigned Content-Disposition, so fall back to a `download` query
	// param that R2/most CDNs honour to suggest the filename.
	if (process.env.S3_PUBLIC_URL) {
		const base = `${process.env.S3_PUBLIC_URL}/${key}`;
		return opts?.downloadFilename
			? `${base}?response-content-disposition=${encodeURIComponent(`attachment; filename="${opts.downloadFilename}"`)}`
			: base;
	}

	const command = new GetObjectCommand({
		Bucket: BUCKET,
		Key: key,
		...(opts?.downloadFilename && {
			ResponseContentDisposition: `attachment; filename="${opts.downloadFilename}"`,
		}),
	});

	return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/** Delete a file from storage */
export async function deleteFile(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET,
		Key: key,
	});

	await s3.send(command);
}

/**
 * Round-trips a tiny object through the bucket (PUT → GET → DELETE) to confirm
 * storage is reachable and writable. Used by the pre-event self-test. Throws on
 * any failure so the caller can surface the error message.
 */
export async function checkStorageRoundTrip(): Promise<void> {
	const key = generateKey("healthcheck", "txt");
	const body = `photocall-healthcheck-${Date.now()}`;

	await s3.send(
		new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: "text/plain" }),
	);
	try {
		const result = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
		const readBack = await result.Body?.transformToString();
		if (readBack !== body) {
			throw new Error("Storage round-trip returned unexpected contents");
		}
	} finally {
		await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {
			// Best-effort cleanup; the health object is tiny and short-lived.
		});
	}
}
