/**
 * Print-sheet layout helpers that arrange an already-composed strip onto a
 * physical sheet. Distinct from the {@link ./compositor}, which renders the
 * strip artwork itself; this operates on the finished strip image.
 */

import { PAPER_SIZE_MM } from "@/lib/layout/types";

/** Gutter between the two strips, as a fraction of the sheet width. */
const TWO_UP_GUTTER_FRACTION = 0.02;

export interface TiledPrintResult {
	blob: Blob;
	width: number;
	height: number;
}

/**
 * Pixel dimensions of the landscape 4×6 sheet used for 2-up tiling at a given
 * dpi. Uses the same mm→px math as {@link printPixelSize} (long side horizontal,
 * no bleed) so two portrait strips fit side-by-side along the long edge.
 */
export function twoUpSheetSize(dpi: number): { width: number; height: number } {
	const { widthMm, heightMm } = PAPER_SIZE_MM["4x6"];
	const pxPerMm = dpi / 25.4;
	return {
		width: Math.round(Math.max(widthMm, heightMm) * pxPerMm),
		height: Math.round(Math.min(widthMm, heightMm) * pxPerMm),
	};
}

/**
 * Duplicate a vertical strip side-by-side onto a single landscape 4×6 sheet so
 * it can be cut into two identical strips. The sheet pixel size uses the same
 * mm→px math as {@link printPixelSize} (4×6 in landscape, no bleed). Each strip
 * is scaled to fit the sheet height and the pair is centered horizontally with
 * a small gutter between them.
 */
export async function tileStripTwoUp(
	stripBlob: Blob,
	stripWidth: number,
	stripHeight: number,
	dpi: number,
): Promise<TiledPrintResult> {
	const { width: sheetWidth, height: sheetHeight } = twoUpSheetSize(dpi);

	const canvas = document.createElement("canvas");
	canvas.width = sheetWidth;
	canvas.height = sheetHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not get canvas context");

	// White sheet background so any letterboxing prints as paper-white.
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, sheetWidth, sheetHeight);

	const strip = await loadStripImage(stripBlob);

	// Scale each strip to fill the full sheet height, preserving aspect ratio.
	// Prefer the decoded image's own dimensions, falling back to the caller's.
	const aspect = (strip.naturalWidth || stripWidth) / (strip.naturalHeight || stripHeight);
	const drawHeight = sheetHeight;
	const drawWidth = drawHeight * aspect;

	const gutter = sheetWidth * TWO_UP_GUTTER_FRACTION;
	const pairWidth = drawWidth * 2 + gutter;
	const startX = (sheetWidth - pairWidth) / 2;
	const offsetY = (sheetHeight - drawHeight) / 2;

	ctx.drawImage(strip, startX, offsetY, drawWidth, drawHeight);
	ctx.drawImage(strip, startX + drawWidth + gutter, offsetY, drawWidth, drawHeight);

	const blob = await canvasToBlob(canvas, 0.92);
	return { blob, width: sheetWidth, height: sheetHeight };
}

/** Load the strip blob into an HTMLImageElement, revoking the object URL after. */
async function loadStripImage(blob: Blob): Promise<HTMLImageElement> {
	const url = URL.createObjectURL(blob);
	try {
		return await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error("Failed to load strip image for tiling"));
			img.src = url;
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Failed to create blob"));
			},
			"image/jpeg",
			quality,
		);
	});
}
