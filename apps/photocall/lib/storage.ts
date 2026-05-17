import {
	DeleteObjectCommand,
	GetObjectCommand,
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

/** Generate a presigned GET URL for reading a file */
export async function getFileUrl(key: string): Promise<string> {
	// If a public URL base is configured, use it directly
	if (process.env.S3_PUBLIC_URL) {
		return `${process.env.S3_PUBLIC_URL}/${key}`;
	}

	const command = new GetObjectCommand({
		Bucket: BUCKET,
		Key: key,
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
