import { describe, expect, it } from "vitest";
import { resolveTokens } from "@/lib/compose/tokens";

describe("resolveTokens", () => {
	it("replaces all three tokens", () => {
		const result = resolveTokens("{coupleNames} · {date} · {eventName}", {
			coupleNames: "Alex & Sam",
			date: "2026-06-16",
			eventName: "Wedding",
		});
		expect(result).toBe("Alex & Sam · 2026-06-16 · Wedding");
	});

	it("replaces a partial set, leaving others empty", () => {
		const result = resolveTokens("{coupleNames}{date}{eventName}", {
			coupleNames: "Alex",
		});
		expect(result).toBe("Alex");
	});

	it("resolves missing tokens to empty strings", () => {
		const result = resolveTokens("[{coupleNames}][{date}][{eventName}]", {});
		expect(result).toBe("[][][]");
	});

	it("replaces repeated occurrences of a token", () => {
		const result = resolveTokens("{date} - {date}", { date: "X" });
		expect(result).toBe("X - X");
	});
});
