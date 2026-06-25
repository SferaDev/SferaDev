"use client";

/**
 * Client-side boomerang/GIF capture helpers.
 *
 * A boomerang is a short burst of frames grabbed from the live camera, played
 * forward then in reverse (a palindrome) so it loops seamlessly. We downscale
 * frames to keep the encoded GIF small enough to upload over flaky wifi, then
 * encode an animated GIF entirely on the client with `gifenc`.
 *
 * Everything here touches `document`/`canvas`, so it must only run in the
 * browser (callers already guard with "use client" + capability checks).
 */

import { applyPalette, GIFEncoder, type GifPalette, quantize } from "gifenc";

/** Tuning constants — kept conservative so GIFs stay small and uploadable. */
export const BOOMERANG_FRAME_COUNT = 20;
/** Total record duration for the forward burst (ms). */
export const BOOMERANG_RECORD_MS = 2000;
/** Per-frame delay in the output GIF (ms). ~70ms ≈ 14fps, a lively loop. */
export const BOOMERANG_FRAME_DELAY_MS = 70;
/**
 * Longest edge of the encoded GIF (px). At 1080p a single-slot boomerang is a
 * crisp, share-worthy clip; a ~38-frame loop lands around 3–6 MB, which the
 * presigned R2 upload accepts (no Content-Length cap on that path). The encode
 * runs behind a "processing" overlay and yields to the event loop per frame, so
 * the extra pixels never freeze the UI.
 */
export const BOOMERANG_MAX_DIMENSION = 1080;

/** A single captured frame, already downscaled to the target GIF size. */
export interface BoomerangFrame {
	data: ImageData;
	width: number;
	height: number;
}

export interface RecordFramesOptions {
	/** The live, playing camera video element to grab frames from. */
	video: HTMLVideoElement;
	/** Mirror frames horizontally (front camera, matching the preview). */
	mirrored: boolean;
	/** Digital zoom (center crop) matching the live preview. 1 = no zoom. */
	zoom?: number;
	/** Number of frames to grab. Defaults to {@link BOOMERANG_FRAME_COUNT}. */
	frameCount?: number;
	/** Total burst duration in ms. Defaults to {@link BOOMERANG_RECORD_MS}. */
	durationMs?: number;
	/** Longest output edge in px. Defaults to {@link BOOMERANG_MAX_DIMENSION}. */
	maxDimension?: number;
	/** Invoked after each grab with 0..1 progress, for UI feedback. */
	onProgress?: (progress: number) => void;
}

/**
 * Compute the downscaled output size for a video, capping the longest edge at
 * `maxDimension` and snapping to even numbers (some encoders prefer it).
 */
function targetSize(
	videoWidth: number,
	videoHeight: number,
	maxDimension: number,
): { width: number; height: number } {
	const longest = Math.max(videoWidth, videoHeight);
	const scale = longest > maxDimension ? maxDimension / longest : 1;
	const width = Math.max(2, Math.round((videoWidth * scale) / 2) * 2);
	const height = Math.max(2, Math.round((videoHeight * scale) / 2) * 2);
	return { width, height };
}

/**
 * Grab `frameCount` frames from the live camera over `durationMs`, downscaling
 * each into an offscreen canvas. Yields to the event loop between frames so the
 * UI (countdown ring, etc.) stays responsive.
 */
export async function recordBoomerangFrames(
	options: RecordFramesOptions,
): Promise<BoomerangFrame[]> {
	const {
		video,
		mirrored,
		zoom = 1,
		frameCount = BOOMERANG_FRAME_COUNT,
		durationMs = BOOMERANG_RECORD_MS,
		maxDimension = BOOMERANG_MAX_DIMENSION,
		onProgress,
	} = options;

	const videoWidth = video.videoWidth;
	const videoHeight = video.videoHeight;
	if (videoWidth === 0 || videoHeight === 0) {
		throw new Error("Camera is not ready");
	}

	const { width, height } = targetSize(videoWidth, videoHeight, maxDimension);

	// Center-crop source rect for the requested zoom (1 = full frame).
	const safeZoom = Math.max(1, zoom);
	const srcWidth = videoWidth / safeZoom;
	const srcHeight = videoHeight / safeZoom;
	const srcX = (videoWidth - srcWidth) / 2;
	const srcY = (videoHeight - srcHeight) / 2;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) {
		throw new Error("Could not create drawing context");
	}

	const frames: BoomerangFrame[] = [];
	const interval = frameCount > 1 ? durationMs / (frameCount - 1) : 0;

	for (let i = 0; i < frameCount; i++) {
		context.save();
		if (mirrored) {
			context.translate(width, 0);
			context.scale(-1, 1);
		}
		context.drawImage(video, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);
		context.restore();

		frames.push({ data: context.getImageData(0, 0, width, height), width, height });
		onProgress?.((i + 1) / frameCount);

		if (i < frameCount - 1) {
			await new Promise((resolve) => setTimeout(resolve, interval));
		}
	}

	return frames;
}

/**
 * Build a palindrome (forward + reverse) so the loop bounces back and forth
 * seamlessly. The first and last frames are not duplicated at the turning
 * points, keeping the motion smooth.
 */
export function toPalindrome<T>(frames: readonly T[]): T[] {
	if (frames.length <= 1) return [...frames];
	const reversed = frames.slice(1, -1).reverse();
	return [...frames, ...reversed];
}

export interface EncodeGifOptions {
	/** Per-frame delay in ms. Defaults to {@link BOOMERANG_FRAME_DELAY_MS}. */
	frameDelayMs?: number;
	/** Invoked with 0..1 encoding progress, for UI feedback. */
	onProgress?: (progress: number) => void;
}

/** Pixel layout passed to gifenc's quantize/applyPalette. rgb565 keeps far more
 * color fidelity than rgb444 (5–6–5 vs 4–4–4 bits per channel). */
const GIF_FORMAT = "rgb565";

/**
 * Find the index of the palette color nearest to (r, g, b) by squared Euclidean
 * distance in RGB space. gifenc's `applyPalette` does this same nearest match
 * internally, but we need it here to know the quantization error each pixel
 * incurs so {@link ditherToPalette} can diffuse it (Floyd–Steinberg).
 *
 * The 8-bit channels are first snapped to rgb565 (5–6–5 bits, ≤65536 distinct
 * keys) and the resulting index is memoized in `cache` — the exact strategy
 * gifenc uses so smooth regions (which dominate a boomerang) cost one lookup
 * instead of a 256-entry scan. That keeps a 1080p × ~38-frame encode responsive.
 */
function nearestPaletteIndex(
	palette: GifPalette,
	cache: Int16Array,
	r: number,
	g: number,
	b: number,
): number {
	// Clamp the error-diffused channels back into 0..255 before snapping to 565.
	const r8 = r < 0 ? 0 : r > 255 ? 255 : r;
	const g8 = g < 0 ? 0 : g > 255 ? 255 : g;
	const b8 = b < 0 ? 0 : b > 255 ? 255 : b;
	const key = ((r8 >> 3) << 11) | ((g8 >> 2) << 5) | (b8 >> 3);

	const cached = cache[key];
	if (cached !== -1) return cached;

	let best = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (let p = 0; p < palette.length; p++) {
		const color = palette[p];
		const dr = r8 - color[0];
		const dg = g8 - color[1];
		const db = b8 - color[2];
		const distance = dr * dr + dg * dg + db * db;
		if (distance < bestDistance) {
			bestDistance = distance;
			best = p;
		}
	}
	cache[key] = best;
	return best;
}

/**
 * Floyd–Steinberg dither an RGBA buffer toward `palette`, in place.
 *
 * gifenc has no dithering of its own — `applyPalette` only does a flat
 * nearest-color match, which leaves visible banding on the gradients common in
 * boomerangs (skin tones, skies, soft backgrounds). We instead snap each pixel
 * to its nearest palette color and push the rounding error onto the
 * not-yet-processed neighbors with the classic FS weights (7/16 right, 3/16
 * down-left, 5/16 down, 1/16 down-right), which trades banding for fine noise
 * the eye reads as smooth shading.
 *
 * Mutating the RGBA in place means the subsequent `applyPalette` call lands on
 * the exact same nearest colors we picked here, so the GIF matches the dither.
 * The error is carried in a Float32 row pair (current + next) to avoid
 * re-reading already-quantized bytes, and stays per-frame so frames don't smear
 * into each other.
 */
function ditherToPalette(
	rgba: Uint8ClampedArray,
	width: number,
	height: number,
	palette: GifPalette,
): void {
	// Two rolling rows of accumulated error (RGB), so we never allocate the whole
	// image worth of floats. `current` feeds the row being processed; `next` is
	// filled as we diffuse downward, then swapped in.
	let current = new Float32Array(width * 3);
	let next = new Float32Array(width * 3);
	// rgb565 → palette-index memo (one slot per possible 565 key). -1 = unseen.
	const cache = new Int16Array(65536).fill(-1);

	for (let y = 0; y < height; y++) {
		next.fill(0);
		for (let x = 0; x < width; x++) {
			const pixel = (y * width + x) * 4;
			const errIndex = x * 3;

			const r = rgba[pixel] + current[errIndex];
			const g = rgba[pixel + 1] + current[errIndex + 1];
			const b = rgba[pixel + 2] + current[errIndex + 2];

			const color = palette[nearestPaletteIndex(palette, cache, r, g, b)];
			rgba[pixel] = color[0];
			rgba[pixel + 1] = color[1];
			rgba[pixel + 2] = color[2];
			// Alpha is left untouched; boomerang frames are fully opaque.

			const errR = r - color[0];
			const errG = g - color[1];
			const errB = b - color[2];

			// 7/16 → pixel to the right (same row).
			if (x + 1 < width) {
				const right = errIndex + 3;
				current[right] += (errR * 7) / 16;
				current[right + 1] += (errG * 7) / 16;
				current[right + 2] += (errB * 7) / 16;
			}
			// 3/16 → down-left, 5/16 → down, 1/16 → down-right (next row).
			if (x - 1 >= 0) {
				const downLeft = errIndex - 3;
				next[downLeft] += (errR * 3) / 16;
				next[downLeft + 1] += (errG * 3) / 16;
				next[downLeft + 2] += (errB * 3) / 16;
			}
			next[errIndex] += (errR * 5) / 16;
			next[errIndex + 1] += (errG * 5) / 16;
			next[errIndex + 2] += (errB * 5) / 16;
			if (x + 1 < width) {
				const downRight = errIndex + 3;
				next[downRight] += (errR * 1) / 16;
				next[downRight + 1] += (errG * 1) / 16;
				next[downRight + 2] += (errB * 1) / 16;
			}
		}
		// Roll the rows: next becomes current, reuse the old buffer for the row after.
		[current, next] = [next, current];
	}
}

/**
 * Encode a sequence of frames into an animated, infinitely-looping GIF blob.
 * Quantizes each frame to its own 256-color rgb565 palette and Floyd–Steinberg
 * dithers toward it (to kill banding) before mapping pixels to palette indices,
 * yielding to the event loop between frames so the main thread stays free.
 */
export async function encodeBoomerangGif(
	frames: readonly BoomerangFrame[],
	options: EncodeGifOptions = {},
): Promise<Blob> {
	const { frameDelayMs = BOOMERANG_FRAME_DELAY_MS, onProgress } = options;
	if (frames.length === 0) {
		throw new Error("No frames to encode");
	}

	const encoder = GIFEncoder();

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		const rgba = frame.data.data;
		const palette: GifPalette = quantize(rgba, 256, { format: GIF_FORMAT });
		// Dither in place first, then map: applyPalette re-runs the same
		// nearest-color match, so it reproduces exactly the dithered result.
		ditherToPalette(rgba, frame.width, frame.height, palette);
		const index = applyPalette(rgba, palette, GIF_FORMAT);

		encoder.writeFrame(index, frame.width, frame.height, {
			palette,
			delay: frameDelayMs,
			// 0 = loop forever. Only honored on the first frame.
			repeat: 0,
		});

		onProgress?.((i + 1) / frames.length);
		await new Promise((resolve) => setTimeout(resolve, 0));
	}

	encoder.finish();
	const bytes = encoder.bytes();
	// Copy into a fresh ArrayBuffer-backed view so the Blob owns standalone
	// bytes (gifenc reuses an internal growing buffer).
	return new Blob([bytes.slice()], { type: "image/gif" });
}

/**
 * Full pipeline: record a burst, build the boomerang palindrome, and encode the
 * GIF. Returns the blob plus its dimensions (for the photo record).
 */
export async function captureBoomerang(
	options: RecordFramesOptions & EncodeGifOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
	const frames = await recordBoomerangFrames(options);
	const looped = toPalindrome(frames);
	const blob = await encodeBoomerangGif(looped, {
		frameDelayMs: options.frameDelayMs,
		onProgress: options.onProgress,
	});
	return { blob, width: frames[0].width, height: frames[0].height };
}
