import { describe, expect, it } from "vitest";
import { parseRawShotKeys } from "@/lib/db/schema";

describe("parseRawShotKeys", () => {
	it("parses a JSON array of storage keys", () => {
		expect(parseRawShotKeys('["photos/a.jpeg","photos/b.jpeg"]')).toEqual([
			"photos/a.jpeg",
			"photos/b.jpeg",
		]);
	});

	it("returns an empty array for null/empty input", () => {
		expect(parseRawShotKeys(null)).toEqual([]);
		expect(parseRawShotKeys("")).toEqual([]);
	});

	it("returns an empty array for malformed or non-array JSON", () => {
		expect(parseRawShotKeys("not json")).toEqual([]);
		expect(parseRawShotKeys('{"a":1}')).toEqual([]);
	});
});
