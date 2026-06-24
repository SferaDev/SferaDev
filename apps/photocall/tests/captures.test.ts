import { describe, expect, it } from "vitest";
import { createPhotoSlot } from "@/components/template-editor/factory";
import { requiredCaptureCount, slotCaptureIndex, slotCaptureIndices } from "@/lib/layout/captures";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";
import type { BoothLayout, PhotoSlot } from "@/lib/layout/types";

/** Build a minimal layout from per-slot captureIndex values (undefined = new). */
function layoutWith(captureIndices: Array<number | undefined>): BoothLayout {
	const base = BUILTIN_PRESETS[0].layout;
	const photoSlots: PhotoSlot[] = captureIndices.map((captureIndex) => ({
		...createPhotoSlot(),
		captureIndex,
	}));
	return { ...base, id: "test", photoSlots };
}

describe("captures (default 1:1 behavior)", () => {
	it("assigns each slot its own sequential capture when none reuse", () => {
		const layout = layoutWith([undefined, undefined, undefined]);
		expect(slotCaptureIndices(layout)).toEqual([1, 2, 3]);
		expect(requiredCaptureCount(layout)).toBe(3);
		expect(slotCaptureIndex(layout, 0)).toBe(1);
		expect(slotCaptureIndex(layout, 2)).toBe(3);
	});

	it("matches photoSlots.length for every builtin preset (no captureIndex set)", () => {
		for (const preset of BUILTIN_PRESETS) {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };
			expect(requiredCaptureCount(layout)).toBe(layout.photoSlots.length);
			expect(slotCaptureIndices(layout)).toEqual(layout.photoSlots.map((_, index) => index + 1));
		}
	});
});

describe("captures (reuse via captureIndex)", () => {
	it("reuses an earlier capture without consuming a new one", () => {
		// 4 slots shot from 2 poses: slots 3 & 4 repeat captures 1 & 2.
		const layout = layoutWith([undefined, undefined, 1, 2]);
		expect(slotCaptureIndices(layout)).toEqual([1, 2, 1, 2]);
		expect(requiredCaptureCount(layout)).toBe(2);
	});

	it("counts only new captures between reused ones", () => {
		// new, repeat-1, new, repeat-1 → 2 distinct captures (slots 1 and 3).
		const layout = layoutWith([undefined, 1, undefined, 1]);
		expect(slotCaptureIndices(layout)).toEqual([1, 1, 2, 1]);
		expect(requiredCaptureCount(layout)).toBe(2);
	});

	it("supports a strip where a single pose fills every slot", () => {
		const layout = layoutWith([undefined, 1, 1, 1]);
		expect(slotCaptureIndices(layout)).toEqual([1, 1, 1, 1]);
		expect(requiredCaptureCount(layout)).toBe(1);
	});

	it("throws for an out-of-range slot index", () => {
		const layout = layoutWith([undefined, undefined]);
		expect(() => slotCaptureIndex(layout, 5)).toThrow(RangeError);
	});
});
