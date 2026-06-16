import { describe, expect, it } from "vitest";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";
import {
	type BoothLayout,
	canvasPixelSize,
	type PrintMetadata,
	printPixelSize,
	shotCount,
} from "@/lib/layout/types";

describe("printPixelSize", () => {
	it("computes selphy postcard at 300dpi (~1181x1748)", () => {
		const print: PrintMetadata = {
			paperSize: "selphy_postcard",
			orientation: "portrait",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		};
		const { width, height } = printPixelSize(print);
		expect(width).toBe(1181);
		expect(height).toBe(1748);
	});

	it("computes 2x6 strip at 300dpi (~675x1800)", () => {
		const print: PrintMetadata = {
			paperSize: "2x6_strip",
			orientation: "portrait",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		};
		const { width, height } = printPixelSize(print);
		expect(width).toBe(675);
		expect(height).toBe(1800);
	});

	it("swaps dimensions for landscape orientation", () => {
		const portrait = printPixelSize({
			paperSize: "selphy_postcard",
			orientation: "portrait",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		});
		const landscape = printPixelSize({
			paperSize: "selphy_postcard",
			orientation: "landscape",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		});
		expect(landscape.width).toBe(portrait.height);
		expect(landscape.height).toBe(portrait.width);
	});
});

describe("canvasPixelSize", () => {
	it("derives height from aspect ratio", () => {
		const layout = BUILTIN_PRESETS[0].layout;
		const full: BoothLayout = { ...layout, id: "test" };
		const { width, height } = canvasPixelSize(full, 1000);
		expect(width).toBe(1000);
		expect(height).toBe(Math.round(1000 * layout.aspectRatio));
	});
});

describe("shotCount", () => {
	it("equals the number of photo slots", () => {
		for (const preset of BUILTIN_PRESETS) {
			const layout: BoothLayout = { ...preset.layout, id: preset.id };
			expect(shotCount(layout)).toBe(layout.photoSlots.length);
		}
	});
});
