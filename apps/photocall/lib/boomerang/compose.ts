"use client";

/**
 * Animated boomerang compositing.
 *
 * A boomerang is a short burst of camera frames played forward then reversed (a
 * palindrome). This module decorates that clip with a chosen template the same
 * way the photo strips are decorated: the animated clip fills the template's
 * FIRST photo slot, and the template's background + graphic + text layers are
 * baked AROUND it. The chosen filter is baked into every frame.
 *
 * The static layers (everything except the photo slot) never change between
 * frames, so we render them ONCE into a reusable base canvas and, for each
 * frame, redraw that base + the single moving photo slot. That keeps the cost
 * per frame to one base blit + one slot draw rather than re-rendering the whole
 * template N times.
 *
 * Everything here touches `document`/`canvas`, so it must only run in the
 * browser (callers already guard with "use client").
 */

import {
	drawBackground,
	drawGraphicLayer,
	drawPhotoSlot,
	drawTextLayer,
} from "@/lib/compose/compositor";
import type { LayoutTokens } from "@/lib/compose/tokens";
import type { BoothLayout, FilterKind } from "@/lib/layout/types";
import { BOOMERANG_MAX_DIMENSION, type BoomerangFrame } from "./encode";

/**
 * Output pixel size of the composited boomerang: the layout's aspect ratio
 * (`height / width`), scaled so the longest edge is capped at `maxDimension`
 * (defaults to {@link BOOMERANG_MAX_DIMENSION} = 1080 for a crisp, share-worthy
 * clip). Snapped to even numbers (some GIF encoders prefer it). Pure +
 * canvas-free so it can be unit-tested.
 */
export function boomerangCompositeSize(
	layout: BoothLayout,
	maxDimension: number = BOOMERANG_MAX_DIMENSION,
): { width: number; height: number } {
	const aspect = layout.aspectRatio > 0 ? layout.aspectRatio : 1;
	// aspectRatio is height / width, so a value > 1 means the layout is taller
	// than it is wide and height is the longest edge.
	const longestIsHeight = aspect >= 1;
	const longest = Math.max(2, maxDimension);
	const width = longestIsHeight ? longest / aspect : longest;
	const height = longestIsHeight ? longest : longest * aspect;
	return {
		width: Math.max(2, Math.round(width / 2) * 2),
		height: Math.max(2, Math.round(height / 2) * 2),
	};
}

export interface ComposeBoomerangOptions {
	/** The captured (and already palindromed) frames to decorate. */
	frames: readonly BoomerangFrame[];
	/** The chosen template's parsed layout. */
	layout: BoothLayout;
	/** The guest/host chosen filter, baked into every frame's photo slot. */
	filter: FilterKind;
	/** Token values for the template's text layers. */
	tokens: LayoutTokens;
	/** Resolve a layer/background storage key to a loadable URL. */
	resolveAssetUrl?: (src: string) => string;
	/** Longest output edge in px. Defaults to {@link BOOMERANG_MAX_DIMENSION}. */
	maxDimension?: number;
}

/**
 * Decorate each boomerang frame with the template: bake the static layers once,
 * then draw each frame into the layout's FIRST photo slot (cover-cropped to the
 * slot, honouring cornerRadius / borderWidth / rotation) with `filter` applied.
 *
 * Z-order matches `composeStrip`: background → photo slot → graphic layers →
 * text layers. Multi-slot templates only use the FIRST photo slot for the clip;
 * the remaining slots are left as background (single-slot templates suit
 * boomerangs best).
 *
 * Returns frames sized to {@link boomerangCompositeSize}, ready to encode.
 */
export async function composeBoomerangFrames(
	options: ComposeBoomerangOptions,
): Promise<BoomerangFrame[]> {
	const { frames, layout, filter, tokens, resolveAssetUrl, maxDimension } = options;
	if (frames.length === 0) throw new Error("No frames to compose");

	const slot = layout.photoSlots[0];
	if (!slot) throw new Error("Layout has no photo slot for the boomerang clip");

	const { width, height } = boomerangCompositeSize(layout, maxDimension);
	const resolveSrc = (src: string): string => (resolveAssetUrl ? resolveAssetUrl(src) : src);

	// ── Base canvas: render every static layer ONCE (background + graphics +
	// text). This is reused for every frame, so only the photo slot is redrawn. ──
	const base = document.createElement("canvas");
	base.width = width;
	base.height = height;
	const baseCtx = base.getContext("2d");
	if (!baseCtx) throw new Error("Could not create base canvas context");

	await drawBackground(baseCtx, layout.background, width, height, resolveSrc);
	for (const graphic of layout.graphicLayers) {
		await drawGraphicLayer(baseCtx, graphic, width, height, resolveSrc);
	}
	for (const text of layout.textLayers) {
		drawTextLayer(baseCtx, text, tokens, width, height);
	}

	// ── Per-frame canvas: base blit + the single moving photo slot. ──
	const frameCanvas = document.createElement("canvas");
	frameCanvas.width = width;
	frameCanvas.height = height;
	const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true });
	if (!frameCtx) throw new Error("Could not create frame canvas context");

	// Reuse one small canvas to hold each frame's pixels as a drawable source.
	const source = document.createElement("canvas");
	source.width = frames[0].width;
	source.height = frames[0].height;
	const sourceCtx = source.getContext("2d");
	if (!sourceCtx) throw new Error("Could not create source canvas context");

	const composed: BoomerangFrame[] = [];
	for (const frame of frames) {
		// Put the raw frame pixels onto the source canvas so drawPhotoSlot can
		// cover-crop them into the slot (ImageData can't be drawImage'd directly).
		if (source.width !== frame.width || source.height !== frame.height) {
			source.width = frame.width;
			source.height = frame.height;
		}
		sourceCtx.putImageData(frame.data, 0, 0);

		frameCtx.clearRect(0, 0, width, height);
		frameCtx.drawImage(base, 0, 0);
		// `filter` is passed as the layout-level filter; drawPhotoSlot honours a
		// per-slot `filterOverride` over it, exactly like the strip compositor.
		drawPhotoSlot(frameCtx, slot, source, frame.width, frame.height, filter, width, height);

		composed.push({ data: frameCtx.getImageData(0, 0, width, height), width, height });
	}

	return composed;
}
