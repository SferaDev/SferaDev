import { describe, expect, it } from "vitest";
import { createPhotoSlot, deriveKind } from "@/components/template-editor/factory";
import {
	type PixelRect,
	snapRect,
	toNormalized,
	toPixels,
} from "@/components/template-editor/geometry";
import type { BoothLayout } from "@/lib/layout/types";
import { LAYOUT_SCHEMA_VERSION } from "@/lib/layout/types";

const stage = { width: 400, height: 600 };

describe("normalized ↔ pixel mapping", () => {
	it("round-trips a normalized rect through stage pixels", () => {
		const rect = { x: 0.25, y: 0.1, width: 0.5, height: 0.3 };
		const pixels = toPixels(rect, stage);
		expect(pixels).toEqual({ x: 100, y: 60, width: 200, height: 180 });
		expect(toNormalized(pixels, stage)).toEqual(rect);
	});

	it("scales x/width by width and y/height by height", () => {
		const pixels = toPixels({ x: 1, y: 1, width: 1, height: 1 }, stage);
		expect(pixels).toEqual({ x: 400, y: 600, width: 400, height: 600 });
	});
});

describe("snapRect", () => {
	it("snaps a near-centered rect to the canvas center", () => {
		const moving: PixelRect = { x: 101, y: 200, width: 200, height: 100 };
		const result = snapRect(moving, [], stage);
		// Center of moving (201) should snap to canvas center (200) → x = 100.
		expect(result.x).toBe(100);
		expect(result.guides.some((g) => g.orientation === "vertical")).toBe(true);
	});

	it("leaves a rect untouched when no target is within threshold", () => {
		const moving: PixelRect = { x: 50, y: 50, width: 30, height: 30 };
		const result = snapRect(moving, [], stage, 2);
		expect(result.x).toBe(50);
		expect(result.guides).toHaveLength(0);
	});
});

describe("factory", () => {
	it("creates normalized photo slots within 0..1", () => {
		const slot = createPhotoSlot();
		for (const value of [slot.x, slot.y, slot.width, slot.height]) {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(1);
		}
	});

	it("derives kind from slot count", () => {
		const base: BoothLayout = {
			version: LAYOUT_SCHEMA_VERSION,
			id: "t",
			kind: "single",
			aspectRatio: 3,
			background: { type: "color", color: "#fff" },
			filter: "none",
			photoSlots: [],
			textLayers: [],
			graphicLayers: [],
			print: { paperSize: "4x6", orientation: "portrait", dpi: 300, bleedMm: 0, copies: 1 },
		};
		expect(deriveKind({ ...base, photoSlots: [createPhotoSlot()] })).toBe("single");
		expect(
			deriveKind({
				...base,
				aspectRatio: 3,
				photoSlots: [createPhotoSlot(), createPhotoSlot(), createPhotoSlot()],
			}),
		).toBe("strip_vertical");
	});
});
