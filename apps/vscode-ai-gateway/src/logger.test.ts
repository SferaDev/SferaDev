import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock vscode module
vi.mock("vscode", () => ({
	window: {
		createOutputChannel: vi.fn(() => ({
			error: vi.fn(),
			warn: vi.fn(),
			info: vi.fn(),
			debug: vi.fn(),
			trace: vi.fn(),
			show: vi.fn(),
			dispose: vi.fn(),
		})),
	},
}));

import { _resetLoggerForTesting, initializeLogger, logger } from "./logger";

describe("Logger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		_resetLoggerForTesting();
	});

	it("should not throw when logging before initialization", () => {
		expect(() => logger.info("test")).not.toThrow();
		expect(() => logger.error("test")).not.toThrow();
		expect(() => logger.show()).not.toThrow();
	});

	it("should initialize and dispose cleanly", () => {
		const disposable = initializeLogger();
		expect(() => disposable.dispose()).not.toThrow();
	});
});

// Error utility function tests
import { extractErrorMessage, extractTokenCountFromError } from "./logger";

describe("extractErrorMessage", () => {
	it("extracts message from Error object", () => {
		expect(extractErrorMessage(new Error("Something went wrong"))).toBe("Something went wrong");
	});

	it("returns string errors directly", () => {
		expect(extractErrorMessage("Raw error string")).toBe("Raw error string");
	});

	it("extracts message from object with message property", () => {
		expect(extractErrorMessage({ message: "Object error" })).toBe("Object error");
	});

	it("returns fallback for unknown error types", () => {
		expect(extractErrorMessage(null)).toBe("An unexpected error occurred");
		expect(extractErrorMessage(undefined)).toBe("An unexpected error occurred");
		expect(extractErrorMessage(123)).toBe("An unexpected error occurred");
	});

	it("removes 'undefined: ' prefix from error messages", () => {
		expect(extractErrorMessage({ message: "undefined: Some error" })).toBe("Some error");
		expect(extractErrorMessage("UNDEFINED: Some error")).toBe("Some error");
	});

	it("extracts best error from Vercel AI Gateway routing attempts", () => {
		const responseBody = JSON.stringify({
			providerMetadata: {
				gateway: {
					routing: {
						attempts: [
							{ error: "prompt is too long: 204716 tokens > 200000 maximum" },
							{ error: "Generic error" },
						],
					},
				},
			},
		});
		expect(extractErrorMessage({ responseBody })).toBe(
			"prompt is too long: 204716 tokens > 200000 maximum",
		);
	});
});

describe("extractTokenCountFromError", () => {
	it("extracts token counts from Anthropic-style error", () => {
		expect(
			extractTokenCountFromError({ message: "prompt is too long: 204716 tokens > 200000 maximum" }),
		).toEqual({ actualTokens: 204716, maxTokens: 200000 });
	});

	it("handles 'exceeds context window' pattern", () => {
		expect(
			extractTokenCountFromError({ message: "Input exceeds context window of 128000 tokens" }),
		).toEqual({ actualTokens: 128001, maxTokens: 128000 });
	});

	it("returns undefined for non-token-related errors", () => {
		expect(extractTokenCountFromError(new Error("Network failed"))).toBeUndefined();
		expect(extractTokenCountFromError(null)).toBeUndefined();
	});
});
