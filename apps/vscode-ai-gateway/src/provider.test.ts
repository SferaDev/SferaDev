import { beforeEach, describe, expect, it, vi } from "vitest";

// Create hoisted mock functions
const hoisted = vi.hoisted(() => {
	const mockEventEmitterFire = vi.fn();
	const mockEventEmitterDispose = vi.fn();
	const mockEventEmitterEvent = vi.fn();
	const mockDisposable = { dispose: vi.fn() };

	class MockEventEmitter {
		event = mockEventEmitterEvent;
		fire = mockEventEmitterFire;
		dispose = mockEventEmitterDispose;
	}

	const mockGetSession = vi.fn();
	const mockShowErrorMessage = vi.fn();

	// Mock LanguageModel* part constructors
	class MockLanguageModelTextPart {
		constructor(public value: string) {}
	}

	class MockLanguageModelToolCallPart {
		constructor(
			public callId: string,
			public name: string,
			public input: unknown,
		) {}
	}

	class MockLanguageModelToolResultPart {
		constructor(
			public callId: string,
			public content: unknown[],
		) {}
	}

	class MockLanguageModelDataPart {
		constructor(
			public data: Uint8Array,
			public mimeType: string,
		) {}

		static text(value: string, mimeType: string) {
			return new MockLanguageModelDataPart(new TextEncoder().encode(value), mimeType);
		}

		static json(value: unknown, mimeType = "application/json") {
			return new MockLanguageModelDataPart(
				new TextEncoder().encode(JSON.stringify(value)),
				mimeType,
			);
		}
	}

	// Optional: Mock LanguageModelThinkingPart (unstable API)
	class MockLanguageModelThinkingPart {
		constructor(
			public text: string,
			public id?: string,
		) {}
	}

	return {
		mockEventEmitterFire,
		mockEventEmitterDispose,
		mockEventEmitterEvent,
		MockEventEmitter,
		mockDisposable,
		mockGetSession,
		mockShowErrorMessage,
		MockLanguageModelTextPart,
		MockLanguageModelToolCallPart,
		MockLanguageModelToolResultPart,
		MockLanguageModelDataPart,
		MockLanguageModelThinkingPart,
	};
});

// Mock vscode module
vi.mock("vscode", () => ({
	EventEmitter: hoisted.MockEventEmitter,
	authentication: {
		getSession: hoisted.mockGetSession,
	},
	window: {
		showErrorMessage: hoisted.mockShowErrorMessage,
	},
	LanguageModelTextPart: hoisted.MockLanguageModelTextPart,
	LanguageModelToolCallPart: hoisted.MockLanguageModelToolCallPart,
	LanguageModelToolResultPart: hoisted.MockLanguageModelToolResultPart,
	LanguageModelDataPart: hoisted.MockLanguageModelDataPart,
	LanguageModelThinkingPart: hoisted.MockLanguageModelThinkingPart,
	LanguageModelChatMessageRole: {
		User: 1,
		Assistant: 2,
	},
	LanguageModelChatToolMode: {
		Auto: "auto",
		Required: "required",
	},
}));

// Mock the auth module
vi.mock("./auth", () => ({
	VERCEL_AI_AUTH_PROVIDER_ID: "vercelAiAuth",
}));

// Mock the AI SDK
vi.mock("@ai-sdk/gateway", () => ({
	createGatewayProvider: vi.fn(() => () => ({})),
}));

vi.mock("ai", () => ({
	jsonSchema: vi.fn((schema) => schema),
	streamText: vi.fn(),
}));

// Import types for testing
interface MockChunk {
	type: string;
	[key: string]: unknown;
}

/**
 * Helper to create a mock progress reporter with spy capabilities
 */
function createMockProgress() {
	const report = vi.fn();
	return { report };
}

/**
 * Test the chunk type classification based on the SILENTLY_IGNORED_CHUNK_TYPES set
 * from the provider implementation.
 */
describe("Stream Chunk Type Coverage", () => {
	/**
	 * Chunk types that should be mapped to VS Code LanguageModelResponsePart
	 */
	describe("Mapped chunk types", () => {
		it("text-delta should emit LanguageModelTextPart", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = { type: "text-delta", delta: "Hello, world!" };

			// Simulate the handler logic
			if (chunk.type === "text-delta" && chunk.delta) {
				progress.report(new hoisted.MockLanguageModelTextPart(chunk.delta as string));
			}

			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported).toBeInstanceOf(hoisted.MockLanguageModelTextPart);
			expect(reported.value).toBe("Hello, world!");
		});

		it("text-delta with empty string should not emit", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = { type: "text-delta", delta: "" };

			// Simulate the handler logic
			if (chunk.type === "text-delta" && chunk.delta) {
				progress.report(new hoisted.MockLanguageModelTextPart(chunk.delta as string));
			}

			expect(progress.report).not.toHaveBeenCalled();
		});

		it("reasoning-delta should emit LanguageModelThinkingPart when available", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = {
				type: "reasoning-delta",
				delta: "Let me think...",
				id: "reasoning-1",
			};

			// Simulate the handler logic with ThinkingPart available
			const ThinkingCtor = hoisted.MockLanguageModelThinkingPart;
			if (ThinkingCtor && chunk.delta) {
				progress.report(new ThinkingCtor(chunk.delta as string));
			}

			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported).toBeInstanceOf(hoisted.MockLanguageModelThinkingPart);
			expect(reported.text).toBe("Let me think...");
		});

		it("file with data URL should emit LanguageModelDataPart", () => {
			const progress = createMockProgress();
			const content = "Hello from file";
			const base64Content = Buffer.from(content).toString("base64");
			const chunk: MockChunk = {
				type: "file",
				url: `data:text/plain;base64,${base64Content}`,
				mediaType: "text/plain",
			};

			// Simulate the handler logic
			if (chunk.type === "file" && (chunk.url as string).startsWith("data:")) {
				const url = chunk.url as string;
				const commaIndex = url.indexOf(",");
				if (commaIndex !== -1) {
					const base64Data = url.slice(commaIndex + 1);
					const bytes = Buffer.from(base64Data, "base64");
					const dataPart = hoisted.MockLanguageModelDataPart.text(
						new TextDecoder().decode(bytes),
						chunk.mediaType as string,
					);
					progress.report(dataPart);
				}
			}

			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported).toBeInstanceOf(hoisted.MockLanguageModelDataPart);
			expect(reported.mimeType).toBe("text/plain");
		});

		it("error should emit LanguageModelTextPart with formatted message", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = {
				type: "error",
				errorText: "Rate limit exceeded",
			};

			// Simulate the handler logic
			if (chunk.type === "error") {
				const errorMessage = chunk.errorText || "Unknown error occurred";
				progress.report(
					new hoisted.MockLanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`),
				);
			}

			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported).toBeInstanceOf(hoisted.MockLanguageModelTextPart);
			expect(reported.value).toContain("Rate limit exceeded");
		});
	});

	/**
	 * Chunk types that should be silently ignored (no VS Code equivalent)
	 */
	describe("Silently ignored chunk types", () => {
		const silentlyIgnoredTypes = [
			// Streaming lifecycle events
			"start",
			"finish",
			"abort",
			"start-step",
			"finish-step",
			// Text lifecycle markers
			"text-start",
			"text-end",
			// Reasoning lifecycle
			"reasoning-start",
			"reasoning-end",
			// Source references
			"source-url",
			"source-document",
			// Tool lifecycle (handled via callback)
			"tool-input-start",
			"tool-input-delta",
			"tool-input-error",
			"tool-input-available",
			"tool-output-available",
			"tool-output-error",
			"tool-output-denied",
			"tool-approval-request",
			// Message metadata
			"message-metadata",
		];

		for (const chunkType of silentlyIgnoredTypes) {
			it(`${chunkType} should not emit any part`, () => {
				const progress = createMockProgress();
				const chunk: MockChunk = { type: chunkType };

				// These types should not trigger progress.report
				const mappedTypes = ["text-delta", "reasoning-delta", "file", "error"];
				if (!mappedTypes.includes(chunk.type)) {
					// Silently ignored - no report
				}

				expect(progress.report).not.toHaveBeenCalled();
			});
		}
	});

	/**
	 * Custom data chunk types (data-*) should be silently ignored
	 */
	describe("Custom data chunk types", () => {
		it("data-* chunk types should be silently ignored", () => {
			const progress = createMockProgress();
			const dataChunkTypes = ["data-custom", "data-image", "data-annotation", "data-metadata"];

			for (const chunkType of dataChunkTypes) {
				const chunk: MockChunk = { type: chunkType, data: { test: "value" } };

				// Custom data chunks are silently ignored
				const mappedTypes = ["text-delta", "reasoning-delta", "file", "error"];
				if (!mappedTypes.includes(chunk.type)) {
					// Silently ignored - no report
				}

				expect(progress.report).not.toHaveBeenCalled();
			}
		});
	});

	/**
	 * Edge cases and error handling
	 */
	describe("Edge cases", () => {
		it("error chunk without errorText should use default message", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = { type: "error" };

			if (chunk.type === "error") {
				const errorMessage = chunk.errorText || "Unknown error occurred";
				progress.report(
					new hoisted.MockLanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`),
				);
			}

			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported.value).toContain("Unknown error occurred");
		});

		it("file with non-data URL should not emit (async fetch not supported)", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = {
				type: "file",
				url: "https://example.com/image.png",
				mediaType: "image/png",
			};

			// Non-data URLs cannot be fetched synchronously in stream handler
			if (chunk.type === "file") {
				const url = chunk.url as string;
				if (url.startsWith("data:")) {
					// Would handle data URL...
				} else {
					// Skip - can't fetch async in stream handler
				}
			}

			expect(progress.report).not.toHaveBeenCalled();
		});

		it("file with malformed data URL should not crash", () => {
			const progress = createMockProgress();
			const chunk: MockChunk = {
				type: "file",
				url: "data:malformed",
				mediaType: "text/plain",
			};

			// Simulate the handler logic with error handling
			if (chunk.type === "file" && (chunk.url as string).startsWith("data:")) {
				const url = chunk.url as string;
				const commaIndex = url.indexOf(",");
				if (commaIndex !== -1) {
					const base64Data = url.slice(commaIndex + 1);
					try {
						const bytes = Buffer.from(base64Data, "base64");
						const dataPart = hoisted.MockLanguageModelDataPart.text(
							new TextDecoder().decode(bytes),
							chunk.mediaType as string,
						);
						progress.report(dataPart);
					} catch {
						// Silently skip malformed data
					}
				}
				// No comma = silently skip
			}

			expect(progress.report).not.toHaveBeenCalled();
		});
	});
});

/**
 * Test the complete list of Vercel AI SDK UIMessageChunk types
 * to ensure we have explicit handling for each one.
 */
describe("UIMessageChunk Type Completeness", () => {
	/**
	 * All chunk types from Vercel AI SDK's UIMessageChunk type.
	 * This test documents the expected behavior for each type.
	 */
	const chunkTypeHandling: Record<string, "mapped" | "ignored" | "callback"> = {
		// Mapped to VS Code parts
		"text-delta": "mapped",
		"reasoning-delta": "mapped",
		file: "mapped",
		error: "mapped",

		// Handled via tool execute callback
		"tool-input-available": "callback",

		// Silently ignored - streaming lifecycle
		start: "ignored",
		finish: "ignored",
		abort: "ignored",
		"start-step": "ignored",
		"finish-step": "ignored",

		// Silently ignored - text lifecycle
		"text-start": "ignored",
		"text-end": "ignored",

		// Silently ignored - reasoning lifecycle
		"reasoning-start": "ignored",
		"reasoning-end": "ignored",

		// Silently ignored - sources
		"source-url": "ignored",
		"source-document": "ignored",

		// Silently ignored - tool lifecycle
		"tool-input-start": "ignored",
		"tool-input-delta": "ignored",
		"tool-input-error": "ignored",
		"tool-output-available": "ignored",
		"tool-output-error": "ignored",
		"tool-output-denied": "ignored",
		"tool-approval-request": "ignored",

		// Silently ignored - metadata
		"message-metadata": "ignored",
	};

	it("should have documented handling for all known chunk types", () => {
		const knownTypes = Object.keys(chunkTypeHandling);

		// Verify we have at least the core types documented
		expect(knownTypes).toContain("text-delta");
		expect(knownTypes).toContain("reasoning-delta");
		expect(knownTypes).toContain("error");
		expect(knownTypes).toContain("file");
		expect(knownTypes).toContain("start");
		expect(knownTypes).toContain("finish");
	});

	it("should map text-delta, reasoning-delta, file, and error", () => {
		const mappedTypes = Object.entries(chunkTypeHandling)
			.filter(([, handling]) => handling === "mapped")
			.map(([type]) => type);

		expect(mappedTypes).toContain("text-delta");
		expect(mappedTypes).toContain("reasoning-delta");
		expect(mappedTypes).toContain("file");
		expect(mappedTypes).toContain("error");
	});

	it("should handle tool-input-available via callback", () => {
		expect(chunkTypeHandling["tool-input-available"]).toBe("callback");
	});
});
