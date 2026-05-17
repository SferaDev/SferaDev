import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
	it("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});

	it("merges tailwind conflicts", () => {
		expect(cn("p-4", "p-2")).toBe("p-2");
	});

	it("handles undefined and null inputs", () => {
		expect(cn("base", undefined, null, "end")).toBe("base end");
	});

	it("returns empty string for no inputs", () => {
		expect(cn()).toBe("");
	});
});
