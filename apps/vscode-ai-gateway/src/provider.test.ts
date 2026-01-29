import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtensionContext, LanguageModelChatMessage } from "vscode";
import {
	convertMessages,
	convertSingleMessage,
	isValidMimeType,
	VercelAIChatModelProvider,
} from "./provider";

// Create hoisted mock functions
const hoisted = vi.hoisted(() => {
	const mockEventEmitterFire = vi.fn();
	const mockEventEmitterDispose = vi.fn();
	const mockEventEmitterEvent = vi.fn();

	class MockEventEmitter {
		event = mockEventEmitterEvent;
		fire = mockEventEmitterFire;
		dispose = mockEventEmitterDispose;
	}

	const mockGetSession = vi.fn();
	const mockShowErrorMessage = vi.fn();
	const mockGetConfiguration = vi.fn();

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

		static image(data: Uint8Array, mimeType: string) {
			return new MockLanguageModelDataPart(data, mimeType);
		}

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
		mockGetSession,
		mockShowErrorMessage,
		mockGetConfiguration,
		MockLanguageModelTextPart,
		MockLanguageModelToolCallPart,
		MockLanguageModelToolResultPart,
		MockLanguageModelDataPart,
		MockLanguageModelThinkingPart,
	};
});

vi.mock("vscode", () => ({
	EventEmitter: hoisted.MockEventEmitter,
	authentication: {
		getSession: hoisted.mockGetSession,
	},
	window: {
		showErrorMessage: hoisted.mockShowErrorMessage,
		createOutputChannel: vi.fn(() => ({
			appendLine: vi.fn(),
			show: vi.fn(),
			dispose: vi.fn(),
		})),
	},
	workspace: {
		getConfiguration: hoisted.mockGetConfiguration,
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

vi.mock("./auth", () => ({
	VERCEL_AI_AUTH_PROVIDER_ID: "vercelAiAuth",
}));

vi.mock("@ai-sdk/gateway", () => ({
	createGatewayProvider: vi.fn(() => () => ({})),
}));

vi.mock("ai", () => ({
	jsonSchema: vi.fn((schema) => schema),
	streamText: vi.fn(),
}));

vi.mock("./models", () => ({
	ModelsClient: class {
		getModels = vi.fn();
	},
}));

function createMockProgress() {
	const report = vi.fn();
	return { report };
}

function createProvider() {
	const context = {
		workspaceState: {
			get: vi.fn(),
			update: vi.fn(),
		},
	} as unknown as ExtensionContext;

	return new VercelAIChatModelProvider(context);
}

describe("MIME type validation", () => {
	it.each([
		"text/plain",
		"image/png",
		"image/jpeg",
		"application/json",
		"application/xml",
		"text/html",
		"audio/mpeg",
		"video/mp4",
		"font/woff2",
		"model/gltf+json",
	])("accepts valid MIME type: %s", (mimeType) => {
		expect(isValidMimeType(mimeType)).toBe(true);
	});

	it.each([
		"cache_control",
		"textplain",
		"text/",
		"/plain",
		"text_type/plain",
		"text/sub_type",
		"",
		"invalid",
		"a/b/c",
	])("rejects invalid MIME type: %s", (mimeType) => {
		expect(isValidMimeType(mimeType)).toBe(false);
	});
});

describe("Stream chunk handler", () => {
	beforeEach(() => {
		hoisted.mockGetConfiguration.mockReturnValue({
			get: (_key: string, defaultValue?: unknown) => defaultValue,
		});
	});

	it("should not crash on unexpected chunk types", () => {
		const provider = createProvider();
		const progress = createMockProgress();

		const unexpectedChunks = [
			{ type: "unknown-type" },
			{ type: "custom-data", data: { foo: "bar" } },
			{ type: "", extra: 123 },
			{ type: "data-custom", value: [1, 2, 3] },
		];

		for (const chunk of unexpectedChunks) {
			expect(() => provider.handleStreamChunk(chunk as any, progress)).not.toThrow();
		}
	});

	it.each([
		"start",
		"start-step",
		"abort",
		"finish",
		"finish-step",
		"text-start",
		"text-end",
		"reasoning-start",
		"reasoning-end",
		"source",
		"tool-result",
		"tool-input-start",
		"tool-input-delta",
	])("ignored chunk type '%s' never reports progress", (type) => {
		const provider = createProvider();
		const progress = createMockProgress();
		provider.handleStreamChunk({ type } as any, progress);
		expect(progress.report).not.toHaveBeenCalled();
	});

	it.each([
		"hello",
		"world",
		"test message",
		"a",
	])("text-delta reports LanguageModelTextPart for non-empty text: %s", (text) => {
		const provider = createProvider();
		const progress = createMockProgress();
		provider.handleStreamChunk({ type: "text-delta", text } as any, progress);
		expect(progress.report).toHaveBeenCalledTimes(1);
		const reported = progress.report.mock.calls[0][0];
		expect(reported).toBeInstanceOf(hoisted.MockLanguageModelTextPart);
	});

	it("tool-call chunks report LanguageModelToolCallPart", () => {
		const provider = createProvider();
		const testCases = [
			{ callId: "call-1", name: "searchDocs", args: { query: "test" } },
			{ callId: "call-2", name: "readFile", args: { path: "/tmp/file.txt" } },
			{ callId: "abc-123", name: "tool", args: {} },
		];

		for (const { callId, name, args } of testCases) {
			const progress = createMockProgress();
			provider.handleStreamChunk(
				{
					type: "tool-call",
					toolCallId: callId,
					toolName: name,
					args,
				} as any,
				progress,
			);
			expect(progress.report).toHaveBeenCalledTimes(1);
			const reported = progress.report.mock.calls[0][0];
			expect(reported).toBeInstanceOf(hoisted.MockLanguageModelToolCallPart);
			expect(reported.callId).toBe(callId);
			expect(reported.name).toBe(name);
		}
	});

	it("skips cache_control metadata in file chunks", () => {
		const provider = createProvider();
		const progress = createMockProgress();

		provider.handleStreamChunk(
			{
				type: "file",
				file: {
					base64: "",
					uint8Array: new Uint8Array([1, 2, 3]),
					mediaType: "cache_control",
				},
			} as any,
			progress,
		);

		expect(progress.report).not.toHaveBeenCalled();
	});

	it("handles file chunks with valid MIME types", () => {
		const provider = createProvider();

		const fixtures = [
			{ mimeType: "image/png", data: new Uint8Array([137, 80, 78, 71]), shouldReport: true },
			{ mimeType: "text/plain", data: new TextEncoder().encode("hello"), shouldReport: true },
			{
				mimeType: "application/json",
				data: new TextEncoder().encode(JSON.stringify({ ok: true })),
				shouldReport: true,
			},
			{ mimeType: "cache_control", data: new Uint8Array([1]), shouldReport: false },
		];

		for (const fixture of fixtures) {
			const progress = createMockProgress();
			provider.handleStreamChunk(
				{
					type: "file",
					file: {
						base64: "",
						uint8Array: fixture.data,
						mediaType: fixture.mimeType,
					},
				} as any,
				progress,
			);

			if (fixture.shouldReport) {
				expect(progress.report).toHaveBeenCalledTimes(1);
				const reported = progress.report.mock.calls[0][0];
				expect(reported).toBeInstanceOf(hoisted.MockLanguageModelDataPart);
			} else {
				expect(progress.report).not.toHaveBeenCalled();
			}
		}
	});
});

describe("Message conversion", () => {
	it("should not crash on varied content shapes", () => {
		const testContents = [
			[new hoisted.MockLanguageModelTextPart("hello")],
			[new hoisted.MockLanguageModelDataPart(new Uint8Array([1, 2, 3]), "text/plain")],
			[new hoisted.MockLanguageModelToolCallPart("call-1", "tool", { arg: "value" })],
			[new hoisted.MockLanguageModelToolResultPart("call-1", [{ value: "result" }])],
			["string content"],
			[],
		];

		for (const content of testContents) {
			const msg = {
				role: 1,
				content,
			} as unknown as LanguageModelChatMessage;

			expect(() => convertSingleMessage(msg, {})).not.toThrow();
		}
	});

	it("maps tool result names using the prior tool call", () => {
		const messages = [
			{
				role: 2,
				content: [
					new hoisted.MockLanguageModelToolCallPart("test-call-1", "searchDocs", { query: "test" }),
				],
			} as unknown as LanguageModelChatMessage,
			{
				role: 2,
				content: [
					new hoisted.MockLanguageModelToolResultPart("test-call-1", [{ value: "result" }]),
				],
			} as unknown as LanguageModelChatMessage,
		];

		const converted = convertMessages(messages);
		const toolResult = converted.find(
			(msg) =>
				msg.role === "tool" && Array.isArray(msg.content) && msg.content[0]?.type === "tool-result",
		);

		expect(toolResult).toBeDefined();
		if (toolResult && Array.isArray(toolResult.content)) {
			const toolResultPart = toolResult.content[0];
			expect(toolResultPart.type).toBe("tool-result");
			expect("toolName" in toolResultPart).toBe(true);
			if ("toolName" in toolResultPart) {
				expect(toolResultPart.toolName).toBe("searchDocs");
			}
		}
	});
});
