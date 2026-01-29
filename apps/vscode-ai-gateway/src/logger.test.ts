import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { _resetLoggerForTesting, extractErrorMessage, initializeLogger, logger } from "./logger";

describe("Logger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		_resetLoggerForTesting();
	});

	it("should not throw when logging before initialization", () => {
		expect(() => logger.info("test")).not.toThrow();
		expect(() => logger.error("test")).not.toThrow();
	});

	it("should initialize and dispose cleanly", () => {
		const disposable = initializeLogger();
		expect(() => disposable.dispose()).not.toThrow();
	});
});

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
});
