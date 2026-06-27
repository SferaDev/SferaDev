import JSZip from "jszip";
import { getAlbumArchive } from "@/actions/album";
import { getFileBytes } from "@/lib/storage";

// Reads cookies (the access gate) and the S3 client, so it must run on the Node
// runtime and never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A large album can take a while to fetch and zip; allow more than the default.
export const maxDuration = 60;

/**
 * Streams an album's photos as a single ZIP. The archive is assembled here, on
 * the server, because the storage bucket has no CORS — so the browser cannot
 * fetch the objects to build the ZIP itself. Access is gated identically to the
 * public album view.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;

	const archive = await getAlbumArchive(code);
	if (!archive) {
		return new Response("Album not found or downloads are disabled", { status: 404 });
	}
	if (archive.keys.length === 0) {
		return new Response("This album has no photos to download", { status: 404 });
	}

	const zip = new JSZip();
	await Promise.all(
		archive.keys.map(async (key, index) => {
			const bytes = await getFileBytes(key);
			const ext = key.split(".").pop() || "jpg";
			zip.file(`${String(index + 1).padStart(3, "0")}.${ext}`, bytes);
		}),
	);

	// JSZip defaults to STORE (no compression), which is right here: the photos
	// are already JPEG/PNG, so deflating would burn CPU for no meaningful saving.
	const body = await zip.generateAsync({ type: "arraybuffer" });
	const safeName = archive.eventName.replace(/["\\\r\n]/g, "").trim() || "album";

	return new Response(body, {
		headers: {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="${safeName}-album.zip"`,
			"Content-Length": String(body.byteLength),
		},
	});
}
