import { describe, expect, it } from "vitest";
import { generateSlug, generateToken, hashPin, verifyPin } from "@/lib/auth-helpers";

describe("generateToken", () => {
	it("returns a string of the default length (32)", () => {
		const token = generateToken();
		expect(token).toHaveLength(32);
	});

	it("returns a string of the specified length", () => {
		const token = generateToken(16);
		expect(token).toHaveLength(16);
	});

	it("contains only alphanumeric characters", () => {
		const token = generateToken(100);
		expect(token).toMatch(/^[A-Za-z0-9]+$/);
	});

	it("generates unique tokens on each call", () => {
		const tokens = new Set(Array.from({ length: 50 }, () => generateToken()));
		expect(tokens.size).toBe(50);
	});
});

describe("generateSlug", () => {
	it("converts a name to a lowercase slug", () => {
		expect(generateSlug("My Event")).toBe("my-event");
	});

	it("replaces multiple special characters with a single hyphen", () => {
		expect(generateSlug("Hello   World!!!")).toBe("hello-world");
	});

	it("strips leading and trailing hyphens", () => {
		expect(generateSlug("--hello--")).toBe("hello");
	});

	it("handles names with numbers", () => {
		expect(generateSlug("Event 2024")).toBe("event-2024");
	});

	it("handles names with accented characters by removing them", () => {
		expect(generateSlug("Café Résumé")).toBe("caf-r-sum");
	});

	it("returns empty string for all-special-character input", () => {
		expect(generateSlug("!!!")).toBe("");
	});
});

describe("hashPin / verifyPin", () => {
	it("hashes a pin and returns hash and salt", async () => {
		const result = await hashPin("1234");
		expect(result).toHaveProperty("hash");
		expect(result).toHaveProperty("salt");
		expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
		expect(result.salt).toHaveLength(16);
	});

	it("produces different hashes for the same pin (due to random salt)", async () => {
		const a = await hashPin("1234");
		const b = await hashPin("1234");
		expect(a.hash).not.toBe(b.hash);
		expect(a.salt).not.toBe(b.salt);
	});

	it("verifies a correct pin", async () => {
		const { hash, salt } = await hashPin("5678");
		const isValid = await verifyPin("5678", hash, salt);
		expect(isValid).toBe(true);
	});

	it("rejects an incorrect pin", async () => {
		const { hash, salt } = await hashPin("5678");
		const isValid = await verifyPin("0000", hash, salt);
		expect(isValid).toBe(false);
	});
});
