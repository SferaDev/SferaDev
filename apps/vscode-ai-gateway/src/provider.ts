import { createGatewayProvider } from "@ai-sdk/gateway";
import { jsonSchema, type ModelMessage, streamText, type ToolSet, type UIMessageChunk } from "ai";
import * as vscode from "vscode";
import {
	authentication,
	type CancellationToken,
	type ExtensionContext,
	type LanguageModelChatInformation,
	type LanguageModelChatMessage,
	LanguageModelChatMessageRole,
	type LanguageModelChatProvider,
	LanguageModelChatToolMode,
	LanguageModelDataPart,
	type LanguageModelResponsePart,
	LanguageModelTextPart,
	LanguageModelToolCallPart,
	LanguageModelToolResultPart,
	type Progress,
	type ProvideLanguageModelChatResponseOptions,
	window,
} from "vscode";

/**
 * Type alias for the chunk types emitted by Vercel AI SDK's toUIMessageStream().
 * This is the subset of UIMessageChunk types we handle.
 */
type StreamChunk = UIMessageChunk;

import { VERCEL_AI_AUTH_PROVIDER_ID } from "./auth";
import { ERROR_MESSAGES } from "./constants";
import { ModelsClient } from "./models";

/**
 * Set of chunk types that are silently ignored because they have no
 * VS Code LanguageModelResponsePart equivalent.
 *
 * Per RFC 10137 and VS Code API analysis:
 * - LanguageModelResponsePart = LanguageModelTextPart | LanguageModelToolResultPart
 *                              | LanguageModelToolCallPart | LanguageModelDataPart
 * - No LanguageModelThinkingPart exists (reasoning-* chunks are skipped unless
 *   the unstable API is available)
 * - Source, step, start/finish, abort chunks are streaming metadata only
 */
const SILENTLY_IGNORED_CHUNK_TYPES = new Set([
	// Streaming lifecycle events - no content to emit
	"start",
	"finish",
	"abort",
	"start-step",
	"finish-step",
	// Text lifecycle markers - we only care about deltas
	"text-start",
	"text-end",
	// Reasoning lifecycle - no stable API equivalent
	"reasoning-start",
	"reasoning-end",
	// Source references - no VS Code equivalent
	"source-url",
	"source-document",
	// Tool lifecycle handled via execute callback
	"tool-input-start",
	"tool-input-delta",
	"tool-input-error",
	"tool-output-available",
	"tool-output-error",
	"tool-output-denied",
	"tool-approval-request",
	// Message metadata - internal bookkeeping
	"message-metadata",
]);

export class VercelAIChatModelProvider implements LanguageModelChatProvider {
	private modelsClient: ModelsClient;

	constructor(_context: ExtensionContext) {
		this.modelsClient = new ModelsClient();
	}

	async provideLanguageModelChatInformation(
		options: { silent: boolean },
		_token: CancellationToken,
	): Promise<LanguageModelChatInformation[]> {
		const apiKey = await this.getApiKey(options.silent);
		if (!apiKey) {
			return [];
		}

		try {
			return await this.modelsClient.getModels(apiKey);
		} catch (error) {
			console.error(ERROR_MESSAGES.MODELS_FETCH_FAILED, error);
			return [];
		}
	}

	async provideLanguageModelChatResponse(
		model: LanguageModelChatInformation,
		chatMessages: readonly LanguageModelChatMessage[],
		options: ProvideLanguageModelChatResponseOptions,
		progress: Progress<LanguageModelResponsePart>,
		token: CancellationToken,
	): Promise<void> {
		const abortController = new AbortController();
		const abortSubscription = token.onCancellationRequested(() => abortController.abort());

		try {
			const apiKey = await this.getApiKey(false);
			if (!apiKey) {
				throw new Error(ERROR_MESSAGES.API_KEY_NOT_FOUND);
			}

			const gateway = createGatewayProvider({ apiKey });

			const tools: ToolSet = {};
			for (const { name, description, inputSchema } of options.tools || []) {
				tools[name] = {
					description,
					inputSchema: jsonSchema(inputSchema || { type: "object", properties: {} }),
					execute: async (
						input: Record<string, unknown>,
						{ toolCallId }: { toolCallId: string },
					) => {
						progress.report(new LanguageModelToolCallPart(toolCallId, name, input));
						return { toolCallId, name, input };
					},
				} as unknown as ToolSet[string];
			}

			const response = streamText({
				model: gateway(model.id),
				messages: convertMessages(chatMessages),
				toolChoice: options.toolMode === LanguageModelChatToolMode.Auto ? "auto" : "required",
				temperature: options.modelOptions?.temperature ?? 0.7,
				tools,
				abortSignal: abortController.signal,
			});

			for await (const chunk of response.toUIMessageStream()) {
				this.handleStreamChunk(chunk as StreamChunk, progress);
			}
		} catch (error) {
			console.error("[VercelAI] Exception during streaming:", error);
			const errorMessage = this.extractErrorMessage(error);
			progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`));
		} finally {
			abortSubscription.dispose();
		}
	}

	async provideTokenCount(
		_model: LanguageModelChatInformation,
		text: string | LanguageModelChatMessage,
		_token: CancellationToken,
	): Promise<number> {
		if (typeof text === "string") {
			return Math.ceil(text.length / 4);
		}

		let totalTokens = 0;
		for (const part of text.content) {
			if (part instanceof LanguageModelTextPart) {
				totalTokens += Math.ceil(part.value.length / 4);
			}
		}
		return totalTokens;
	}

	private async getApiKey(silent: boolean): Promise<string | undefined> {
		try {
			const session = await authentication.getSession(VERCEL_AI_AUTH_PROVIDER_ID, [], {
				createIfNone: !silent,
				silent,
			});
			return session?.accessToken;
		} catch (error) {
			if (!silent) {
				console.error("Failed to get authentication session:", error);
				window.showErrorMessage(ERROR_MESSAGES.AUTH_FAILED);
			}
			return undefined;
		}
	}

	/**
	 * Handle a single stream chunk from Vercel AI SDK's toUIMessageStream().
	 *
	 * Maps Vercel AI chunk types to VS Code LanguageModelResponsePart:
	 * - text-delta → LanguageModelTextPart
	 * - reasoning-delta → LanguageModelThinkingPart (if available, else skip)
	 * - file → LanguageModelDataPart
	 * - error → LanguageModelTextPart (formatted as error message)
	 * - tool-input-available → Already handled via tool execute callback
	 * - Other types → Silently ignored (no VS Code equivalent)
	 */
	private handleStreamChunk(
		chunk: StreamChunk,
		progress: Progress<LanguageModelResponsePart>,
	): void {
		switch (chunk.type) {
			case "text-delta":
				if (chunk.delta) {
					progress.report(new LanguageModelTextPart(chunk.delta));
				}
				break;

			case "reasoning-delta":
				this.handleReasoningDelta(chunk, progress);
				break;

			case "file":
				this.handleFileChunk(chunk, progress);
				break;

			case "error":
				this.handleErrorChunk(chunk, progress);
				break;

			case "tool-input-available":
				// Tool calls are handled via the execute callback in ToolSet,
				// which reports LanguageModelToolCallPart directly.
				// This chunk is informational only.
				break;

			default:
				this.handleUnknownChunk(chunk, progress);
				break;
		}
	}

	/**
	 * Handle reasoning-delta chunks using the unstable LanguageModelThinkingPart.
	 *
	 * This constructor is not in the stable VS Code API, so we use dynamic lookup.
	 * If the constructor doesn't exist, the reasoning content is silently skipped
	 * (there's no equivalent stable API surface).
	 */
	private handleReasoningDelta(
		chunk: { type: "reasoning-delta"; delta: string; id: string },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		const vsAny = vscode as unknown as Record<string, unknown>;
		const ThinkingCtor = vsAny.LanguageModelThinkingPart as
			| (new (
					text: string,
					id?: string,
					metadata?: unknown,
			  ) => unknown)
			| undefined;

		if (ThinkingCtor && chunk.delta) {
			progress.report(
				new (ThinkingCtor as new (text: string) => LanguageModelResponsePart)(chunk.delta),
			);
		}
		// If ThinkingCtor doesn't exist, silently skip - no stable API equivalent
	}

	/**
	 * Handle file chunks by mapping to LanguageModelDataPart.
	 *
	 * Files from the AI SDK have a URL and mediaType. We fetch the data
	 * and emit it as a LanguageModelDataPart.
	 */
	private handleFileChunk(
		chunk: { type: "file"; url: string; mediaType: string },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		// For data URLs, extract the base64 content directly
		if (chunk.url.startsWith("data:")) {
			const commaIndex = chunk.url.indexOf(",");
			if (commaIndex !== -1) {
				const base64Data = chunk.url.slice(commaIndex + 1);
				try {
					const bytes = Buffer.from(base64Data, "base64");
					const dataPart = LanguageModelDataPart.text(
						new TextDecoder().decode(bytes),
						chunk.mediaType,
					);
					progress.report(dataPart);
				} catch (error) {
					console.warn("[VercelAI] Failed to decode file data URL:", error);
				}
			}
		} else {
			// For regular URLs, we can't fetch synchronously in the stream handler.
			// Log and skip - this is a limitation of the streaming architecture.
			console.debug(
				"[VercelAI] Skipping non-data file URL (async fetch not supported in stream):",
				chunk.url,
			);
		}
	}

	/**
	 * Handle error chunks by emitting a formatted error message as text.
	 */
	private handleErrorChunk(
		chunk: { type: "error"; errorText: string },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		const errorMessage = chunk.errorText || "Unknown error occurred";
		progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`));
	}

	/**
	 * Handle unknown/unmapped chunk types.
	 *
	 * Chunks in SILENTLY_IGNORED_CHUNK_TYPES are expected and logged at debug level.
	 * Truly unknown chunks are logged as warnings to help identify API changes.
	 */
	private handleUnknownChunk(
		chunk: StreamChunk,
		_progress: Progress<LanguageModelResponsePart>,
	): void {
		const chunkType = (chunk as { type?: string }).type;

		if (chunkType && SILENTLY_IGNORED_CHUNK_TYPES.has(chunkType)) {
			// Expected chunk type with no VS Code equivalent - debug log only
			console.debug("[VercelAI] Ignored expected chunk type:", chunkType);
		} else if (chunkType?.startsWith("data-")) {
			// Custom data chunks - silently ignore
			console.debug("[VercelAI] Ignored data chunk type:", chunkType);
		} else {
			// Truly unknown chunk type - warn to help identify API changes
			console.warn(
				"[VercelAI] Unknown stream chunk type:",
				chunkType,
				JSON.stringify(chunk, null, 2),
			);
		}
	}

	private extractErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}
		if (typeof error === "string") {
			return error;
		}
		if (error && typeof error === "object" && "message" in error) {
			return String(error.message);
		}
		return "An unexpected error occurred";
	}
}

function convertMessages(messages: readonly LanguageModelChatMessage[]): ModelMessage[] {
	const result = messages.flatMap(convertSingleMessage).filter(isValidMessage);
	fixSystemMessages(result);
	return result;
}

function convertSingleMessage(msg: LanguageModelChatMessage): ModelMessage[] {
	const results: ModelMessage[] = [];
	const role = msg.role === LanguageModelChatMessageRole.User ? "user" : "assistant";
	const tools: Record<string, string> = {};

	for (const part of msg.content) {
		if (typeof part === "object" && part !== null) {
			if (isTextPart(part)) {
				results.push({ role, content: part.value });
			} else if (part instanceof LanguageModelToolCallPart) {
				results.push({
					role: "assistant",
					content: [
						{
							type: "tool-call",
							toolName: part.name,
							toolCallId: part.callId,
							input: part.input,
						},
					],
				});
				tools[part.callId] = part.name;
			} else if (part instanceof LanguageModelToolResultPart) {
				const resultTexts = extractToolResultTexts(part);
				if (resultTexts.length > 0) {
					results.push({
						role: "tool",
						content: [
							{
								type: "tool-result",
								toolCallId: part.callId,
								toolName: tools[part.callId] || "unknown",
								output: { type: "text", value: resultTexts.join(" ") },
							},
						],
					});
				}
			}
		}
	}

	if (results.length === 0) {
		console.debug("[VercelAI] Message had no valid content, creating placeholder");
		results.push({ role, content: "" });
	}

	return results;
}

function isTextPart(part: object): part is { value: string } {
	return "value" in part && typeof (part as { value: unknown }).value === "string";
}

function extractToolResultTexts(part: LanguageModelToolResultPart): string[] {
	return part.content
		.filter(
			(resultPart): resultPart is { value: string } =>
				typeof resultPart === "object" && resultPart !== null && "value" in resultPart,
		)
		.map((resultPart) => resultPart.value);
}

function isValidMessage(msg: ModelMessage): boolean {
	return typeof msg.content === "string"
		? msg.content.trim().length > 0
		: Array.isArray(msg.content)
			? msg.content.length > 0
			: false;
}

function fixSystemMessages(result: ModelMessage[]): void {
	const firstUserIndex = result.findIndex((msg) => msg.role === "user");
	for (let i = 0; i < firstUserIndex; i++) {
		if (result[i].role === "assistant") {
			result[i].role = "system";
		}
	}
}
