import type { BoothLayout } from "@/lib/layout/types";

/**
 * Pixel size of the editor's Konva stage for a given on-screen width. Height
 * derives from the layout aspect ratio, exactly like the compositor canvas, so
 * what the user edits matches what `composeStrip` renders.
 */
export function stageSize(
	layout: BoothLayout,
	stageWidth: number,
): { width: number; height: number } {
	return { width: stageWidth, height: stageWidth * layout.aspectRatio };
}

/** A normalized 0..1 rectangle as stored in the BoothLayout. */
export interface NormalizedRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** A pixel-space rectangle in stage coordinates. */
export interface PixelRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Map a normalized rect to stage pixels. X/width scale by stage width, Y/height
 * by stage height — the same convention the compositor uses.
 */
export function toPixels(
	rect: NormalizedRect,
	stage: { width: number; height: number },
): PixelRect {
	return {
		x: rect.x * stage.width,
		y: rect.y * stage.height,
		width: rect.width * stage.width,
		height: rect.height * stage.height,
	};
}

/** Map a pixel-space rect back to normalized 0..1 BoothLayout coordinates. */
export function toNormalized(
	rect: PixelRect,
	stage: { width: number; height: number },
): NormalizedRect {
	return {
		x: rect.x / stage.width,
		y: rect.y / stage.height,
		width: rect.width / stage.width,
		height: rect.height / stage.height,
	};
}

/** Clamp a value into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/** A snap guide line to render while dragging, in stage pixel coordinates. */
export interface SnapGuide {
	orientation: "vertical" | "horizontal";
	/** Stage-pixel position along the cross axis. */
	position: number;
}

export interface SnapResult {
	x: number;
	y: number;
	guides: SnapGuide[];
}

/**
 * Snap a moving rectangle's edges/center to the canvas edges/center and to the
 * edges/centers of sibling rectangles, within `threshold` pixels. Returns the
 * adjusted top-left position plus the guide lines to draw.
 */
export function snapRect(
	moving: PixelRect,
	siblings: PixelRect[],
	stage: { width: number; height: number },
	threshold = 6,
): SnapResult {
	const verticalTargets = collectTargets(siblings, stage, "vertical");
	const horizontalTargets = collectTargets(siblings, stage, "horizontal");

	const x = snapAxis(moving.x, moving.width, verticalTargets, threshold);
	const y = snapAxis(moving.y, moving.height, horizontalTargets, threshold);

	const guides: SnapGuide[] = [];
	if (x.guide !== null) guides.push({ orientation: "vertical", position: x.guide });
	if (y.guide !== null) guides.push({ orientation: "horizontal", position: y.guide });

	return { x: x.value, y: y.value, guides };
}

/** Candidate snap positions along one axis (canvas + sibling edges/centers). */
function collectTargets(
	siblings: PixelRect[],
	stage: { width: number; height: number },
	orientation: "vertical" | "horizontal",
): number[] {
	const extent = orientation === "vertical" ? stage.width : stage.height;
	const targets = [0, extent / 2, extent];
	for (const sibling of siblings) {
		const start = orientation === "vertical" ? sibling.x : sibling.y;
		const size = orientation === "vertical" ? sibling.width : sibling.height;
		targets.push(start, start + size / 2, start + size);
	}
	return targets;
}

/** Snap one axis: tries the moving rect's start, center and end against targets. */
function snapAxis(
	start: number,
	size: number,
	targets: number[],
	threshold: number,
): { value: number; guide: number | null } {
	const candidates = [
		{ edge: start, offset: 0 },
		{ edge: start + size / 2, offset: size / 2 },
		{ edge: start + size, offset: size },
	];

	let best: { value: number; guide: number; distance: number } | null = null;
	for (const candidate of candidates) {
		for (const target of targets) {
			const distance = Math.abs(candidate.edge - target);
			if (distance <= threshold && (best === null || distance < best.distance)) {
				best = { value: target - candidate.offset, guide: target, distance };
			}
		}
	}

	return best ? { value: best.value, guide: best.guide } : { value: start, guide: null };
}
