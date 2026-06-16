/**
 * Minimal type declarations for `gifenc` (the package ships no TypeScript
 * types). Covers only the surface we use: the streaming GIF encoder plus the
 * color quantization helpers. Kept intentionally narrow so it stays honest.
 *
 * @see https://github.com/mattdesl/gifenc
 */
declare module "gifenc" {
	/** A palette is a list of [R, G, B] or [R, G, B, A] color tuples. */
	export type GifPalette = number[][];

	/** Pixel layout passed to {@link quantize} / {@link applyPalette}. */
	export type GifPixelFormat = "rgb565" | "rgb444" | "rgba4444";

	export interface QuantizeOptions {
		format?: GifPixelFormat;
		clearAlpha?: boolean;
		clearAlphaColor?: number;
		clearAlphaThreshold?: number;
		oneBitAlpha?: boolean | number;
	}

	export interface WriteFrameOptions {
		/** Global/local color table. Required on the first frame of an animation. */
		palette?: GifPalette;
		/** Frame delay in milliseconds. */
		delay?: number;
		/** Loop count: -1 = play once, 0 = loop forever, >0 = specific count. */
		repeat?: number;
		transparent?: boolean;
		transparentIndex?: number;
		dispose?: number;
		first?: boolean;
	}

	export interface GIFEncoderStream {
		writeFrame(index: Uint8Array, width: number, height: number, options?: WriteFrameOptions): void;
		finish(): void;
		bytes(): Uint8Array;
		bytesView(): Uint8Array;
		reset(): void;
	}

	export interface GIFEncoderOptions {
		auto?: boolean;
		initialCapacity?: number;
	}

	export function GIFEncoder(options?: GIFEncoderOptions): GIFEncoderStream;

	/** Build a color palette (up to `maxColors`) from RGBA pixel data. */
	export function quantize(
		rgba: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		options?: QuantizeOptions,
	): GifPalette;

	/** Map each RGBA pixel to the nearest palette index. */
	export function applyPalette(
		rgba: Uint8Array | Uint8ClampedArray,
		palette: GifPalette,
		format?: GifPixelFormat,
	): Uint8Array;
}
