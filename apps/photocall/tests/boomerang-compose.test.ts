import { describe, expect, it } from "vitest";
import { boomerangCompositeSize } from "@/lib/boomerang/compose";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";
import type { BoothLayout } from "@/lib/layout/types";

/** Build a full BoothLayout from a preset (presets omit the `id`). */
function layoutFrom(presetIndex: number): BoothLayout {
	const preset = BUILTIN_PRESETS[presetIndex];
	return { ...preset.layout, id: preset.id };
}

describe("boomerangCompositeSize", () => {
	it("caps the longest edge at the max dimension", () => {
		for (const preset of BUILTIN_PRESETS) {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };
			const { width, height } = boomerangCompositeSize(layout, 480);
			expect(Math.max(width, height)).toBeLessThanOrEqual(480);
		}
	});

	it("preserves the layout aspect ratio (height / width) within rounding", () => {
		for (const preset of BUILTIN_PRESETS) {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };
			const { width, height } = boomerangCompositeSize(layout, 480);
			// aspectRatio is height / width; allow a small tolerance for the
			// round-to-even snapping of both dimensions.
			expect(height / width).toBeCloseTo(layout.aspectRatio, 1);
		}
	});

	it("makes height the longest edge for a tall strip (aspectRatio > 1)", () => {
		// strip_3bw_vertical has aspectRatio 3.2 (much taller than wide).
		const layout = layoutFrom(0);
		expect(layout.aspectRatio).toBeGreaterThan(1);
		const { width, height } = boomerangCompositeSize(layout, 480);
		expect(height).toBe(480);
		expect(width).toBeLessThan(height);
	});

	it("snaps both dimensions to even numbers", () => {
		for (const preset of BUILTIN_PRESETS) {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };
			const { width, height } = boomerangCompositeSize(layout, 537);
			expect(width % 2).toBe(0);
			expect(height % 2).toBe(0);
		}
	});

	it("makes width the longest edge for a wide layout (aspectRatio < 1)", () => {
		const base = layoutFrom(0);
		const wide: BoothLayout = { ...base, aspectRatio: 0.5 };
		const { width, height } = boomerangCompositeSize(wide, 480);
		expect(width).toBe(480);
		expect(height).toBeLessThan(width);
	});

	it("falls back to a square when aspectRatio is non-positive", () => {
		const base = layoutFrom(0);
		const broken: BoothLayout = { ...base, aspectRatio: 0 };
		const { width, height } = boomerangCompositeSize(broken, 480);
		expect(width).toBe(height);
	});
});
