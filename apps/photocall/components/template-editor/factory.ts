import {
	type BoothLayout,
	type GraphicLayer,
	LAYOUT_SCHEMA_VERSION,
	type LayoutKind,
	type PhotoSlot,
	type TextLayer,
} from "@/lib/layout/types";

/** Generate a stable unique id for a new layer/slot. */
function newId(prefix: string): string {
	return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** A blank single-photo layout used when starting an editor without a preset. */
export function blankLayout(): BoothLayout {
	return {
		version: LAYOUT_SCHEMA_VERSION,
		id: crypto.randomUUID(),
		kind: "single",
		aspectRatio: 1.5,
		background: { type: "color", color: "#ffffff" },
		filter: "none",
		photoSlots: [createPhotoSlot()],
		textLayers: [],
		graphicLayers: [],
		print: {
			paperSize: "4x6",
			orientation: "portrait",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		},
	};
}

/** A new photo slot centered on the canvas with neutral defaults. */
export function createPhotoSlot(): PhotoSlot {
	return {
		id: newId("slot"),
		x: 0.25,
		y: 0.25,
		width: 0.5,
		height: 0.5,
		rotation: 0,
		fit: "cover",
		filterOverride: null,
		borderColor: null,
		borderWidth: 0,
		cornerRadius: 0,
		cropOffsetX: 0,
		cropOffsetY: 0,
		cropScale: 1,
	};
}

/** A new text layer with a token placeholder, centered. */
export function createTextLayer(content = "{coupleNames}"): TextLayer {
	return {
		id: newId("text"),
		content,
		x: 0.1,
		y: 0.45,
		width: 0.8,
		rotation: 0,
		fontFamily: "Playfair Display",
		fontSize: 0.06,
		fontWeight: "normal",
		fontStyle: "normal",
		color: "#000000",
		align: "center",
		letterSpacing: 0,
		lineHeight: 1.2,
		opacity: 1,
	};
}

/** A new graphic layer pointing at an uploaded asset storage key. */
export function createGraphicLayer(src: string): GraphicLayer {
	return {
		id: newId("graphic"),
		src,
		x: 0.35,
		y: 0.35,
		width: 0.3,
		height: 0.3,
		rotation: 0,
		opacity: 1,
		blendMode: "normal",
	};
}

/**
 * Derive the LayoutKind from the slot count. The editor lets users add/remove
 * slots freely, so we classify on save to keep stored metadata meaningful.
 */
export function deriveKind(layout: BoothLayout): LayoutKind {
	const count = layout.photoSlots.length;
	if (count <= 1) return "single";
	if (count === 4) return layout.aspectRatio < 1.7 ? "grid_2x2" : "strip_2col";
	if (layout.aspectRatio >= 2.5) return "strip_vertical";
	return "postcard";
}
