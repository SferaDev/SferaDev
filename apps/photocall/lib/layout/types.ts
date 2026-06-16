/**
 * Photobooth layout type model.
 *
 * A `BoothLayout` is a fully declarative description of a composited photo
 * strip / postcard: where each captured photo goes, what text and graphics sit
 * on top, the background, and how it should be printed. All positions and sizes
 * are NORMALIZED in the 0..1 range relative to the canvas width/height; the
 * compositor multiplies them by the chosen target pixel size. This keeps the
 * same JSON usable by the plain Canvas 2D compositor and (later) react-konva.
 */

/** Bumped whenever the layout JSON shape changes in a breaking way. */
export const LAYOUT_SCHEMA_VERSION = 1;

/** Color/contrast filters applied at the pixel (ImageData) level. */
export type FilterKind = "none" | "bw" | "warm" | "cool" | "faded" | "vivid" | "noir";

/** How a photo is fitted into its slot rectangle. */
export type FitMode = "cover" | "contain";

/** A rectangular region that receives one captured photo. */
export interface PhotoSlot {
	id: string;
	/** Normalized 0..1 of canvas width. */
	x: number;
	/** Normalized 0..1 of canvas height. */
	y: number;
	/** Normalized 0..1 of canvas width. */
	width: number;
	/** Normalized 0..1 of canvas height. */
	height: number;
	/** Rotation in degrees, clockwise. */
	rotation: number;
	fit: FitMode;
	/** Overrides the layout-level filter for this slot when set. */
	filterOverride: FilterKind | null;
	/** Border color, or null for no border. */
	borderColor: string | null;
	/** Normalized 0..1 of canvas width. */
	borderWidth: number;
	/** Normalized 0..1 of canvas width. */
	cornerRadius: number;
	/** Pan applied to the source crop, normalized 0..1. */
	cropOffsetX: number;
	cropOffsetY: number;
	/** Zoom applied to the source crop (1 = no zoom). */
	cropScale: number;
}

export type TextAlign = "left" | "center" | "right";

/** A line/block of text rendered on top of the photos. */
export interface TextLayer {
	id: string;
	/** May contain {coupleNames} {date} {eventName} tokens. */
	content: string;
	/** Normalized 0..1 of canvas width. */
	x: number;
	/** Normalized 0..1 of canvas height. */
	y: number;
	/** Wrapping width, normalized 0..1 of canvas width. */
	width: number;
	/** Rotation in degrees, clockwise. */
	rotation: number;
	fontFamily: string;
	/** Normalized 0..1 of canvas height. */
	fontSize: number;
	fontWeight: "normal" | "bold";
	fontStyle: "normal" | "italic";
	color: string;
	align: TextAlign;
	/** Normalized 0..1 of canvas width. */
	letterSpacing: number;
	/** Multiplier of the font size. */
	lineHeight: number;
	opacity: number;
}

/** Canvas compositing blend modes supported for graphic overlays. */
export type BlendMode =
	| "normal"
	| "multiply"
	| "screen"
	| "overlay"
	| "darken"
	| "lighten"
	| "color-dodge"
	| "color-burn"
	| "hard-light"
	| "soft-light"
	| "difference"
	| "exclusion";

/** A decorative image (logo, sticker, frame) drawn over the photos. */
export interface GraphicLayer {
	id: string;
	src: string;
	/** Normalized 0..1 of canvas width. */
	x: number;
	/** Normalized 0..1 of canvas height. */
	y: number;
	/** Normalized 0..1 of canvas width. */
	width: number;
	/** Normalized 0..1 of canvas height. */
	height: number;
	/** Rotation in degrees, clockwise. */
	rotation: number;
	opacity: number;
	blendMode: BlendMode;
}

export interface BackgroundColor {
	type: "color";
	color: string;
}

export interface BackgroundImage {
	type: "image";
	src: string;
	fit: FitMode;
}

export interface GradientStop {
	color: string;
	/** Stop position 0..1. */
	offset: number;
}

export interface BackgroundGradient {
	type: "gradient";
	stops: GradientStop[];
	/** Gradient direction in degrees, clockwise. */
	angle: number;
}

export type Background = BackgroundColor | BackgroundImage | BackgroundGradient;

export type PaperSize = "selphy_postcard" | "4x6" | "5x7" | "2x6_strip" | "6x8" | "a4" | "letter";

/** Physical paper dimensions in millimeters. */
export const PAPER_SIZE_MM: Record<PaperSize, { widthMm: number; heightMm: number }> = {
	selphy_postcard: { widthMm: 100, heightMm: 148 },
	"4x6": { widthMm: 101.6, heightMm: 152.4 },
	"5x7": { widthMm: 127, heightMm: 178 },
	"2x6_strip": { widthMm: 57.15, heightMm: 152.4 },
	"6x8": { widthMm: 152.4, heightMm: 203.2 },
	a4: { widthMm: 210, heightMm: 297 },
	letter: { widthMm: 215.9, heightMm: 279.4 },
};

export type Orientation = "portrait" | "landscape";

export interface PrintMetadata {
	paperSize: PaperSize;
	orientation: Orientation;
	/** Dots per inch for the rendered print file. */
	dpi: number;
	/** Bleed margin in millimeters added on every side. */
	bleedMm: number;
	copies: number;
}

export type LayoutKind = "single" | "strip_vertical" | "strip_2col" | "grid_2x2" | "postcard";

export interface BoothLayout {
	version: number;
	id: string;
	kind: LayoutKind;
	/** Canvas aspect ratio as height / width. */
	aspectRatio: number;
	background: Background;
	filter: FilterKind;
	photoSlots: PhotoSlot[];
	textLayers: TextLayer[];
	graphicLayers: GraphicLayer[];
	print: PrintMetadata;
}

/** Number of captured photos a layout consumes. */
export function shotCount(layout: BoothLayout): number {
	return layout.photoSlots.length;
}

/** Pixel dimensions of the editing/compositing canvas for a target width. */
export function canvasPixelSize(
	layout: BoothLayout,
	targetWidth: number,
): { width: number; height: number } {
	return {
		width: Math.round(targetWidth),
		height: Math.round(targetWidth * layout.aspectRatio),
	};
}

/** Pixel dimensions of the final print file, honoring dpi/orientation/bleed. */
export function printPixelSize(print: PrintMetadata): { width: number; height: number } {
	const { widthMm, heightMm } = PAPER_SIZE_MM[print.paperSize];
	const pxPerMm = print.dpi / 25.4;
	const bleed = print.bleedMm * 2;
	const longSide = Math.max(widthMm, heightMm) + bleed;
	const shortSide = Math.min(widthMm, heightMm) + bleed;

	const printableWidthMm = print.orientation === "landscape" ? longSide : shortSide;
	const printableHeightMm = print.orientation === "landscape" ? shortSide : longSide;

	return {
		width: Math.round(printableWidthMm * pxPerMm),
		height: Math.round(printableHeightMm * pxPerMm),
	};
}
