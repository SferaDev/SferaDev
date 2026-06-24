/**
 * Capture-reuse model for photo slots.
 *
 * By default a layout captures exactly one photo per slot and the compositor
 * maps capture i → slot i (a 1:1 mapping). A {@link PhotoSlot} may instead set
 * an explicit 1-based `captureIndex`, which makes it REUSE an earlier capture
 * rather than consuming a fresh one — so e.g. a 4-slot strip can be shot from
 * only 2–3 distinct poses.
 *
 * Resolution rule: walk `photoSlots` in order. A slot with an explicit
 * `captureIndex` reuses that capture; a slot without one is assigned the next
 * new sequential capture number (1, 2, 3, …). The DISTINCT-capture count is the
 * number of new captures assigned this way. When no slot sets `captureIndex`,
 * this reproduces today's 1:1 behavior exactly.
 */

import type { BoothLayout } from "./types";

/**
 * The 1-based effective capture index for every slot, in slot order. Index i of
 * the returned array is the capture that fills `layout.photoSlots[i]`.
 */
export function slotCaptureIndices(layout: BoothLayout): number[] {
	const indices: number[] = [];
	let nextNewCapture = 0;
	for (const slot of layout.photoSlots) {
		if (slot.captureIndex !== undefined) {
			indices.push(slot.captureIndex);
		} else {
			nextNewCapture += 1;
			indices.push(nextNewCapture);
		}
	}
	return indices;
}

/**
 * The number of DISTINCT new captures the kiosk must take for this layout: the
 * count of slots that consume a fresh capture (i.e. without a `captureIndex`).
 * Defaults to `photoSlots.length` when no slot reuses a capture.
 */
export function requiredCaptureCount(layout: BoothLayout): number {
	return layout.photoSlots.reduce(
		(count, slot) => (slot.captureIndex === undefined ? count + 1 : count),
		0,
	);
}

/**
 * Heal a layout whose slots carry an out-of-range `captureIndex`. Editing,
 * deleting or reordering photo slots can leave a reuse slot pointing at a
 * capture that no longer exists (e.g. delete an earlier new slot), which would
 * make the compositor render that slot BLANK. Walking in order, any slot whose
 * `captureIndex` doesn't reference an already-taken earlier capture is reset to
 * a fresh capture. A clean layout is returned unchanged (referentially) so this
 * is cheap to call on every mutation and on load.
 */
export function normalizeCaptureIndices(layout: BoothLayout): BoothLayout {
	let newCaptures = 0;
	let changed = false;
	const photoSlots = layout.photoSlots.map((slot) => {
		if (slot.captureIndex === undefined) {
			newCaptures += 1;
			return slot;
		}
		if (slot.captureIndex >= 1 && slot.captureIndex <= newCaptures) {
			return slot;
		}
		// Out-of-range reuse → make it consume a fresh capture instead of mapping
		// to a non-existent one (which renders blank at the kiosk).
		changed = true;
		newCaptures += 1;
		return { ...slot, captureIndex: undefined };
	});
	return changed ? { ...layout, photoSlots } : layout;
}

/**
 * The 1-based capture index that fills the slot at `slotIndex`. Throws for an
 * out-of-range slot index so callers fail loudly rather than silently mapping
 * to capture 0.
 */
export function slotCaptureIndex(layout: BoothLayout, slotIndex: number): number {
	const indices = slotCaptureIndices(layout);
	const index = indices[slotIndex];
	if (index === undefined) {
		throw new RangeError(
			`slotCaptureIndex: slot ${slotIndex} is out of range (have ${indices.length} slots)`,
		);
	}
	return index;
}
