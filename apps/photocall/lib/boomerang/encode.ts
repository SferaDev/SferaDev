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
/** Longest edge of the encoded GIF (px). Caps file size on slow connections. */
export const BOOMERANG_MAX_DIMENSION = 480;

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
		context.drawImage(video, 0, 0, width, height);
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

/**
 * Encode a sequence of frames into an animated, infinitely-looping GIF blob.
 * Quantizes each frame to its own 256-color palette for good color fidelity,
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
	const format = "rgb444";

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		const rgba = frame.data.data;
		const palette: GifPalette = quantize(rgba, 256, { format });
		const index = applyPalette(rgba, palette, format);

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
