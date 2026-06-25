import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Build the print-bridge single-file executables and publish them to R2 so the
 * dashboard pairing page can offer them as downloads.
 *
 * The binaries are ~59 MB each × 5 targets, far too large to ship in the repo or
 * the Vercel deploy, so they live in object storage under `bridge-binaries/`.
 *
 * How to run (from the repo root):
 *   1. Export the photocall S3 creds for the target bucket:
 *        S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET
 *      (use the same values photocall runs with so the keys match what
 *      `listBridgeDownloads` looks up).
 *   2. pnpm --filter photocall publish:bridge-bin
 *
 * This shells out to `pnpm --filter @sferadev/print-bridge build:bin`, which
 * cross-compiles every target into `apps/print-bridge/dist/print-bridge-<target>`
 * (with `.exe` on Windows). Each file is then uploaded to R2 at the matching key.
 */

/** Targets produced by `apps/print-bridge/scripts/build-bin.ts`. */
const TARGETS = [
	"bun-darwin-arm64",
	"bun-darwin-x64",
	"bun-linux-x64",
	"bun-linux-arm64",
	"bun-windows-x64",
] as const;

type Target = (typeof TARGETS)[number];

/** Build (and upload) artifacts live here, mirroring the build script's OUTDIR. */
const DIST_DIR = path.resolve(import.meta.dirname, "../../print-bridge/dist");

/** R2 key prefix the dashboard's `listBridgeDownloads` action reads from. */
const KEY_PREFIX = "bridge-binaries";

// Reuse the photocall S3 client configuration (lib/storage.ts doesn't export the
// client, so reconstruct it identically here).
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

/** The on-disk filename and matching R2 key for a target (`.exe` on Windows). */
function artifactFor(target: Target): { filename: string; key: string } {
	const suffix = target.includes("windows") ? ".exe" : "";
	const filename = `print-bridge-${target}${suffix}`;
	return { filename, key: `${KEY_PREFIX}/${filename}` };
}

/** Human-readable size for the upload summary. */
function formatBytes(bytes: number): string {
	const mb = bytes / 1_000_000;
	return `${mb.toFixed(1)} MB`;
}

async function buildBinaries(): Promise<void> {
	console.log("▶ Building print-bridge binaries…");
	const { spawn } = await import("node:child_process");
	const code = await new Promise<number>((resolve, reject) => {
		const proc = spawn("pnpm", ["--filter", "@sferadev/print-bridge", "build:bin"], {
			stdio: "inherit",
		});
		proc.on("error", reject);
		proc.on("exit", (exitCode) => resolve(exitCode ?? 1));
	});
	if (code !== 0) {
		throw new Error(`build:bin failed (exit ${code})`);
	}
}

async function uploadTarget(target: Target): Promise<{ key: string; sizeBytes: number }> {
	const { filename, key } = artifactFor(target);
	const filePath = path.join(DIST_DIR, filename);

	const { size } = await stat(filePath);
	console.log(`▲ Uploading ${filename} (${formatBytes(size)}) → ${key}`);

	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: key,
			// ContentLength lets the SDK stream the file without buffering it in memory.
			Body: createReadStream(filePath),
			ContentLength: size,
			ContentType: "application/octet-stream",
		}),
	);

	return { key, sizeBytes: size };
}

async function main(): Promise<void> {
	await buildBinaries();

	const uploaded: Array<{ key: string; sizeBytes: number }> = [];
	for (const target of TARGETS) {
		uploaded.push(await uploadTarget(target));
	}

	console.log(`\n✔ Published ${uploaded.length} binaries to ${BUCKET}:`);
	for (const { key, sizeBytes } of uploaded) {
		console.log(`  ${key}  ${formatBytes(sizeBytes)}`);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Failed to publish bridge binaries:", error);
		process.exit(1);
	});
