import { describe, expect, it } from "vitest";
import { twoUpSheetSize } from "@/lib/compose/print-layout";
import { printPixelSize } from "@/lib/layout/types";

describe("twoUpSheetSize", () => {
	it("produces a landscape 4×6 sheet (long side horizontal)", () => {
		const sheet = twoUpSheetSize(300);
		expect(sheet.width).toBeGreaterThan(sheet.height);
	});

	it("matches the 4×6 landscape print pixel size at 300dpi", () => {
		const sheet = twoUpSheetSize(300);
		const landscape4x6 = printPixelSize({
			paperSize: "4x6",
			orientation: "landscape",
			dpi: 300,
			bleedMm: 0,
			copies: 1,
		});
		expect(sheet.width).toBe(landscape4x6.width);
		expect(sheet.height).toBe(landscape4x6.height);
	});

	it("scales linearly with dpi", () => {
		const at150 = twoUpSheetSize(150);
		const at300 = twoUpSheetSize(300);
		expect(at300.width).toBe(at150.width * 2);
		expect(at300.height).toBe(at150.height * 2);
	});
});
