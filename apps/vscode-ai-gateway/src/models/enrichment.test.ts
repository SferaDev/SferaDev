import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENRICHMENT_CACHE_TTL_MS } from "../constants";

const hoisted = vi.hoisted(() => {
	const mockGetConfiguration = vi.fn();
	const mockOnDidChangeConfiguration = vi.fn(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_callback?: unknown) => ({ dispose: vi.fn() }),
	);

	class MockEventEmitter {
		private listeners: Set<(...args: unknown[]) => void> = new Set();
		event = (listener: (...args: unknown[]) => void) => {
			this.listeners.add(listener);
			return { dispose: () => this.listeners.delete(listener) };
		};
		fire = (...args: unknown[]) => {
			for (const listener of this.listeners) listener(...args);
		};
		dispose = () => {
			this.listeners.clear();
		};
	}

	const mockOutputChannelAppendLine = vi.fn();
	const mockOutputChannelShow = vi.fn();
	const mockOutputChannelDispose = vi.fn();
	const mockCreateOutputChannel = vi.fn(() => ({
		appendLine: mockOutputChannelAppendLine,
		show: mockOutputChannelShow,
		dispose: mockOutputChannelDispose,
	}));

	return {
		mockGetConfiguration,
		mockOnDidChangeConfiguration,
		MockEventEmitter,
		mockCreateOutputChannel,
	};
});

vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: hoisted.mockGetConfiguration,
		onDidChangeConfiguration: hoisted.mockOnDidChangeConfiguration,
	},
	window: {
		createOutputChannel: hoisted.mockCreateOutputChannel,
	},
	EventEmitter: hoisted.MockEventEmitter,
}));

import { ModelEnricher } from "./enrichment";

describe("ModelEnricher", () => {
	let originalFetch: typeof fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		vi.clearAllMocks();
		hoisted.mockGetConfiguration.mockReturnValue({
			get: vi.fn((key: string, defaultValue: unknown) => {
				if (key === "endpoint") return "https://example.test";
				if (key === "logging.level") return "off";
				if (key === "logging.outputChannel") return false;
				return defaultValue;
			}),
		});
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("returns enriched data for a successful response", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					id: "openai/gpt-4o",
					name: "GPT-4o",
					architecture: { input_modalities: ["text", "image"] },
					endpoints: [
						{
							context_length: 128000,
							max_completion_tokens: 16384,
							supported_parameters: ["max_tokens", "temperature", "tools"],
							supports_implicit_caching: true,
						},
					],
				},
			}),
		});

		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const enricher = new ModelEnricher();
		const result = await enricher.enrichModel("openai:gpt-4o-2024-11-20", "test-api-key");

		expect(result).toEqual({
			context_length: 128000,
			max_completion_tokens: 16384,
			supported_parameters: ["max_tokens", "temperature", "tools"],
			supports_implicit_caching: true,
		});
		expect(mockFetch).toHaveBeenCalledWith(
			"https://example.test/v1/models/openai/gpt-4o/endpoints",
			{
				headers: {
					Authorization: "Bearer test-api-key",
				},
			},
		);
	});

	it("uses cache within TTL and refreshes after expiration", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					id: "openai/gpt-4o",
					name: "GPT-4o",
					endpoints: [
						{
							context_length: 128000,
							max_completion_tokens: 16384,
							supported_parameters: ["max_tokens"],
							supports_implicit_caching: false,
						},
					],
				},
			}),
		});

		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const enricher = new ModelEnricher();

		await enricher.enrichModel("openai:gpt-4o-2024-11-20", "test-api-key");
		await enricher.enrichModel("openai:gpt-4o-2024-11-20", "test-api-key");

		expect(mockFetch).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(ENRICHMENT_CACHE_TTL_MS + 1);
		await enricher.enrichModel("openai:gpt-4o-2024-11-20", "test-api-key");

		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("returns null on 404 responses", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			statusText: "Not Found",
		});

		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const enricher = new ModelEnricher();
		const result = await enricher.enrichModel("openai:gpt-4", "test-api-key");

		expect(result).toBeNull();
	});

	it("returns null on network errors", async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error("Network failure"));

		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const enricher = new ModelEnricher();
		const result = await enricher.enrichModel("openai:gpt-4o-2024-11-20", "test-api-key");

		expect(result).toBeNull();
	});
});
