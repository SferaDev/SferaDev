import { describe, expect, it } from "vitest";
import { parseLayoutJson, serializeLayout } from "@/lib/layout/parse";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";
import type { BoothLayout } from "@/lib/layout/types";

describe("BUILTIN_PRESETS", () => {
	it("contains the four expected presets", () => {
		expect(BUILTIN_PRESETS.map((p) => p.id)).toEqual([
			"strip_3bw_vertical",
			"strip_4cut_2col",
			"grid_2x2_postcard",
			"strip_3_branded",
		]);
	});

	for (const preset of BUILTIN_PRESETS) {
		describe(preset.id, () => {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };

			it("round-trips through serialize/parse", () => {
				const parsed = parseLayoutJson(serializeLayout(layout));
				expect(parsed).not.toBeNull();
				expect(parsed?.id).toBe(preset.id);
			});

			it("has shotCount matching its photo slots", () => {
				expect(preset.shotCount).toBe(layout.photoSlots.length);
			});

			it("keeps every slot within bounds (x + width <= 1.05)", () => {
				for (const slot of layout.photoSlots) {
					expect(slot.x + slot.width).toBeLessThanOrEqual(1.05);
					expect(slot.y + slot.height).toBeLessThanOrEqual(1.05);
				}
			});
		});
	}
});
