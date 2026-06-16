import type { FilterKind } from "@/lib/layout/types";

/** Clamp a channel value into the valid 0..255 byte range. */
function clamp(value: number): number {
	if (value < 0) return 0;
	if (value > 255) return 255;
	return value;
}

/**
 * Apply a color/contrast filter in place to the current contents of the canvas
 * context. Works at the pixel (ImageData) level so it can run on any 2D canvas.
 * `none` is a no-op.
 */
export function applyFilter(
	ctx: CanvasRenderingContext2D,
	filter: FilterKind,
	width: number,
	height: number,
): void {
	if (filter === "none" || width <= 0 || height <= 0) return;

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		switch (filter) {
			case "bw": {
				const gray = 0.299 * r + 0.587 * g + 0.114 * b;
				data[i] = clamp(gray);
				data[i + 1] = clamp(gray);
				data[i + 2] = clamp(gray);
				break;
			}
			case "warm": {
				data[i] = clamp(r * 1.1);
				data[i + 1] = clamp(g * 1.05);
				data[i + 2] = clamp(b * 0.85);
				break;
			}
			case "cool": {
				data[i] = clamp(r * 0.9);
				data[i + 1] = clamp(g * 0.95);
				data[i + 2] = clamp(b * 1.15);
				break;
			}
			case "faded": {
				data[i] = clamp(r * 0.8 + 40);
				data[i + 1] = clamp(g * 0.8 + 40);
				data[i + 2] = clamp(b * 0.8 + 40);
				break;
			}
			case "vivid": {
				const gray = 0.299 * r + 0.587 * g + 0.114 * b;
				data[i] = clamp(gray + (r - gray) * 1.4);
				data[i + 1] = clamp(gray + (g - gray) * 1.4);
				data[i + 2] = clamp(gray + (b - gray) * 1.4);
				break;
			}
			case "noir": {
				const gray = 0.299 * r + 0.587 * g + 0.114 * b;
				// High-contrast S-curve around mid-gray.
				const normalized = gray / 255;
				const curved = 1 / (1 + Math.exp(-12 * (normalized - 0.5)));
				const value = clamp(curved * 255);
				data[i] = value;
				data[i + 1] = value;
				data[i + 2] = value;
				break;
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);
}
