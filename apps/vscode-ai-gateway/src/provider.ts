import { createGatewayProvider } from "@ai-sdk/gateway";
import { jsonSchema, type ModelMessage, streamText, type TextStreamPart, type ToolSet } from "ai";
import { createHash } from "crypto";
import * as vscode from "vscode";
import {
	authentication,
	type CancellationToken,
	type ExtensionContext,
	type LanguageModelChatInformation,
	type LanguageModelChatMessage,
	LanguageModelChatMessageRole,
	type LanguageModelChatProvider,
	type LanguageModelChatRequestMessage,
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
 * Type alias for the chunk types emitted by Vercel AI SDK's fullStream.
 * fullStream provides access to all events including tool-calls, which
 * toUIMessageStream() hides.
 */
type StreamChunk = TextStreamPart<ToolSet>;

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
 * - No LanguageModelThinkingPart exists (reasoning chunks are skipped unless
 *   the unstable API is available)
 * - Source, step, start/finish, abort chunks are streaming metadata only
 *
 * Note: These are fullStream TextStreamPart types, not toUIMessageStream types.
 */
const SILENTLY_IGNORED_CHUNK_TYPES = new Set([
	// Streaming lifecycle events - no content to emit
	"start",
	"finish",
	"abort",
	"start-step",
	"finish-step",
	"reasoning-part-finish",
	// Source references - no VS Code equivalent
	"source",
	// Tool streaming events - we wait for complete tool-call
	"tool-call-streaming-start",
	"tool-call-delta",
	// Tool results only come if we have execute functions (we don't)
	"tool-result",
]);

const MIME_TYPE_PATTERN = /^[a-z]+\/[a-z0-9.+-]+$/i;

export function isValidMimeType(mimeType: string): boolean {
	return MIME_TYPE_PATTERN.test(mimeType);
}

function hashMessage(msg: LanguageModelChatRequestMessage): string {
	const payload = {
		role: msg.role,
		name: msg.name ?? null,
		content: Array.from(msg.content).map((part) => {
			if (part instanceof LanguageModelTextPart) {
				return { type: "text", value: part.value };
			}
			if (part instanceof LanguageModelDataPart) {
				return {
					type: "data",
					mimeType: part.mimeType,
					dataLen: part.data.length,
				};
			}
			if (part instanceof LanguageModelToolCallPart) {
				return { type: "toolCall", name: part.name, callId: part.callId };
			}
			if (part instanceof LanguageModelToolResultPart) {
				return { type: "toolResult", callId: part.callId };
			}
			return { type: "unknown" };
		}),
	};
	return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export class VercelAIChatModelProvider implements LanguageModelChatProvider {
	private context: ExtensionContext;
	private modelsClient: ModelsClient;
	// Track actual token usage from completed requests
	private lastRequestInputTokens: number | null = null;
	private lastRequestOutputTokens: number | null = null;
	private lastRequestMessageCount: number = 0;
	private correctionFactor: number = 1.0;
	private lastEstimatedInputTokens: number = 0;

	constructor(context: ExtensionContext) {
		this.context = context;
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
			// Pre-flight check: estimate total tokens and validate against model limit
			const estimatedTokens = await this.estimateTotalInputTokens(model, chatMessages, token);
			const maxInputTokens = model.maxInputTokens;

			if (estimatedTokens > maxInputTokens) {
				const errorMsg =
					`Input too long: estimated ${estimatedTokens} tokens exceeds model limit of ${maxInputTokens}. ` +
					`Please reduce the context or use a model with a larger context window.`;
				console.error(`[VercelAI] ${errorMsg}`);
				progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMsg}\n\n`));
				return;
			}

			// Warn if we're close to the limit (>80%)
			if (estimatedTokens > maxInputTokens * 0.8) {
				console.warn(
					`[VercelAI] Input is ${Math.round((estimatedTokens / maxInputTokens) * 100)}% of max tokens. ` +
						`Consider reducing context to avoid potential issues.`,
				);
			}

			this.lastEstimatedInputTokens = estimatedTokens;

			const apiKey = await this.getApiKey(false);
			if (!apiKey) {
				throw new Error(ERROR_MESSAGES.API_KEY_NOT_FOUND);
			}

			const gateway = createGatewayProvider({ apiKey });

			// Define tools WITHOUT execute functions - VS Code handles tool execution.
			// The AI SDK will emit tool-call events which we forward to VS Code.
			// VS Code then executes tools and sends results back in subsequent messages.
			const tools: ToolSet = {};
			for (const { name, description, inputSchema } of options.tools || []) {
				tools[name] = {
					description,
					inputSchema: jsonSchema(inputSchema || { type: "object", properties: {} }),
					// No execute function - let tool calls flow through to VS Code
				} as unknown as ToolSet[string];
			}

			// Map tool mode correctly
			let toolChoice: "auto" | "required" | "none" = "auto";
			if (options.toolMode === LanguageModelChatToolMode.Required) {
				toolChoice = "required";
			} else if (Object.keys(tools).length === 0) {
				// No tools available, don't force tool use
				toolChoice = "none";
			}

			// Get system prompt configuration
			const config = vscode.workspace.getConfiguration("vercelAiGateway");
			const systemPromptEnabled = config.get<boolean>("systemPrompt.enabled", false);
			const systemPromptMessage = config.get<string>(
				"systemPrompt.message",
				"You are being accessed through the Vercel AI Gateway VS Code extension. The user is interacting with you via VS Code's chat interface.",
			);

			const response = streamText({
				model: gateway(model.id),
				system:
					systemPromptEnabled && systemPromptMessage?.trim() ? systemPromptMessage : undefined,
				messages: convertMessages(chatMessages),
				toolChoice,
				temperature: options.modelOptions?.temperature ?? 0.7,
				maxTokens: options.modelOptions?.maxOutputTokens ?? 4096,
				tools: Object.keys(tools).length > 0 ? tools : undefined,
				abortSignal: abortController.signal,
			});

			// Use fullStream instead of toUIMessageStream() to get tool-call events.
			// toUIMessageStream() hides tool calls and is designed for UI rendering,
			// while fullStream exposes all events needed for VS Code tool execution.
			for await (const chunk of response.fullStream) {
				this.handleStreamChunk(chunk, progress);
			}

			// Track message count for hybrid token estimation
			this.lastRequestMessageCount = chatMessages.length;
		} catch (error) {
			// Don't report abort/cancellation as an error - it's expected behavior
			if (this.isAbortError(error)) {
				console.debug("[VercelAI] Request was cancelled");
				return;
			}

			console.error("[VercelAI] Exception during streaming:", error);
			const errorMessage = this.extractErrorMessage(error);
			progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`));
		} finally {
			abortSubscription.dispose();
		}
	}

	/**
	 * Check if an error is an abort/cancellation error.
	 */
	private isAbortError(error: unknown): boolean {
		if (error instanceof Error) {
			return (
				error.name === "AbortError" ||
				error.message.includes("aborted") ||
				error.message.includes("cancelled") ||
				error.message.includes("canceled")
			);
		}
		return false;
	}

	/**
	 * Estimate token count for a message.
	 *
	 * This is called by VS Code BEFORE sending messages to decide whether
	 * to compact/truncate. Accurate estimates are critical for avoiding
	 * "input too long" errors.
	 *
	 * Token counting strategy:
	 * - Text: ~3.5 characters per token (conservative, accounts for code/special chars)
	 * - Images: Use model-specific estimates (Anthropic ~1600, OpenAI tile-based)
	 * - Tool calls/results: JSON serialization + overhead
	 */
	async provideTokenCount(
		model: LanguageModelChatInformation,
		text: string | LanguageModelChatMessage,
		_token: CancellationToken,
	): Promise<number> {
		if (typeof text === "string") {
			// Conservative estimate: ~3.5 characters per token
			// This is intentionally conservative to avoid "input too long" errors
			return Math.ceil(text.length / 3.5);
		}

		let totalTokens = 0;
		for (const part of text.content) {
			if (part instanceof LanguageModelTextPart) {
				// Conservative estimate: ~3.5 characters per token
				totalTokens += Math.ceil(part.value.length / 3.5);
			} else if (part instanceof LanguageModelDataPart) {
				// Image token counting is model-specific
				totalTokens += this.estimateImageTokens(model, part);
			} else if (part instanceof LanguageModelToolCallPart) {
				// Tool calls: name + JSON input + overhead for formatting
				const inputJson = JSON.stringify(part.input);
				totalTokens += Math.ceil((part.name.length + inputJson.length + 50) / 3.5);
			} else if (part instanceof LanguageModelToolResultPart) {
				// Tool results: callId + content + overhead
				totalTokens += 20; // Base overhead for tool result structure
				for (const resultPart of part.content) {
					if (typeof resultPart === "object" && resultPart !== null && "value" in resultPart) {
						totalTokens += Math.ceil(String(resultPart.value).length / 3.5);
					}
				}
			}
		}
		return totalTokens;
	}

	/**
	 * Estimate tokens for an image based on the model family.
	 *
	 * Different providers have different image token costs:
	 * - Anthropic: ~1600 tokens per image (fixed)
	 * - OpenAI: Tile-based (~85 tokens per 512x512 tile, min 85, max ~1700)
	 * - Google: Similar to OpenAI tile-based
	 * - Others: Use conservative estimate of 1000 tokens
	 */
	private estimateImageTokens(
		model: LanguageModelChatInformation,
		imagePart: LanguageModelDataPart,
	): number {
		const family = model.family.toLowerCase();

		// Anthropic uses fixed ~1600 tokens per image
		if (family.includes("anthropic") || family.includes("claude")) {
			return 1600;
		}

		// OpenAI and similar use tile-based counting
		// Without knowing image dimensions, estimate based on data size
		// A typical JPEG is ~10-50KB, PNG can be larger
		const dataSize = imagePart.data.byteLength;

		// Estimate dimensions from file size (very rough)
		// Assume ~3 bytes per pixel for compressed image
		const estimatedPixels = dataSize / 3;
		const estimatedDimension = Math.sqrt(estimatedPixels);

		// OpenAI tiles are 512x512, ~85 tokens each
		// Images are scaled to fit within 2048x2048 first
		const scaledDimension = Math.min(estimatedDimension, 2048);
		const tilesPerSide = Math.ceil(scaledDimension / 512);
		const totalTiles = tilesPerSide * tilesPerSide;

		// 85 tokens per tile, plus 85 base tokens
		const openAITokens = 85 + totalTiles * 85;

		// Cap at reasonable maximum (high-res image)
		return Math.min(openAITokens, 1700);
	}

	/**
	 * Estimate total input tokens for all messages.
	 * Used for pre-flight validation before sending to the API.
	 */
	private async estimateTotalInputTokens(
		model: LanguageModelChatInformation,
		messages: readonly LanguageModelChatMessage[],
		token: CancellationToken,
	): Promise<number> {
		// If we have actual data from a previous request in this conversation
		// and new messages have been added (not edited/removed)
		if (
			this.lastRequestInputTokens !== null &&
			messages.length > this.lastRequestMessageCount &&
			this.lastRequestMessageCount > 0
		) {
			// Use actual tokens for known messages, estimate only new ones
			const newMessages = messages.slice(this.lastRequestMessageCount);
			let newTokenEstimate = 0;
			for (const message of newMessages) {
				newTokenEstimate += await this.provideTokenCount(model, message, token);
			}
			// Add overhead for new message structure
			newTokenEstimate += newMessages.length * 4;

			console.debug(
				`[VercelAI] Hybrid token estimation: ${this.lastRequestInputTokens} actual + ${newTokenEstimate} estimated = ${this.lastRequestInputTokens + newTokenEstimate} total`,
			);

			return this.lastRequestInputTokens + newTokenEstimate;
		}

		// Fall back to pure estimation for first request or changed conversation
		let total = 0;
		for (const message of messages) {
			total += await this.provideTokenCount(model, message, token);
		}
		// Add overhead for message structure (~4 tokens per message)
		total += messages.length * 4;

		console.debug(`[VercelAI] Pure estimation: ${total} tokens`);

		return total;
	}

	private getCachedTokenCount(msg: LanguageModelChatRequestMessage): number | undefined {
		const key = `lm.tokens.${hashMessage(msg)}`;
		return this.context.workspaceState.get<number>(key);
	}

	private async setCachedTokenCount(
		msg: LanguageModelChatRequestMessage,
		tokens: number,
	): Promise<void> {
		const key = `lm.tokens.${hashMessage(msg)}`;
		await this.context.workspaceState.update(key, tokens);
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
	 * Handle a single stream chunk from Vercel AI SDK's fullStream.
	 *
	 * Maps Vercel AI TextStreamPart types to VS Code LanguageModelResponsePart:
	 * - text-delta → LanguageModelTextPart
	 * - reasoning-delta → LanguageModelThinkingPart (if available, else skip)
	 * - file → LanguageModelDataPart
	 * - tool-call → LanguageModelToolCallPart (forwarded to VS Code for execution)
	 * - error → LanguageModelTextPart (formatted as error message)
	 * - Other types → Silently ignored (no VS Code equivalent)
	 */
	private handleStreamChunk(
		chunk: StreamChunk,
		progress: Progress<LanguageModelResponsePart>,
	): void {
		switch (chunk.type) {
			case "text-delta":
				// fullStream TextStreamPart uses 'text' field, not 'textDelta'
				if (chunk.text) {
					progress.report(new LanguageModelTextPart(chunk.text));
				}
				break;

			case "reasoning-delta":
				this.handleReasoningChunk(chunk, progress);
				break;

			case "file":
				// fullStream provides file with GeneratedFile object
				this.handleFileChunk(chunk, progress);
				break;

			case "error":
				this.handleErrorChunk(chunk, progress);
				break;

			case "tool-call":
				// Tool calls come through the stream when execute is not provided.
				// Forward to VS Code which will handle execution.
				this.handleToolCall(chunk, progress);
				break;

			// Lifecycle events - no content to emit
			case "start":
			case "start-step":
			case "abort":
				break;

			case "finish-step": {
				const finishChunk = chunk as {
					type: "finish-step";
					usage?: { inputTokens?: number; outputTokens?: number };
				};
				if (finishChunk.usage?.inputTokens !== undefined) {
					this.lastRequestInputTokens = finishChunk.usage.inputTokens;
				}
				if (finishChunk.usage?.outputTokens !== undefined) {
					this.lastRequestOutputTokens = finishChunk.usage.outputTokens;
				}
				break;
			}

			case "finish": {
				const finishChunk = chunk as {
					type: "finish";
					totalUsage?: { inputTokens?: number; outputTokens?: number };
				};
				if (finishChunk.totalUsage?.inputTokens !== undefined) {
					this.lastRequestInputTokens = finishChunk.totalUsage.inputTokens;
				}
				if (finishChunk.totalUsage?.outputTokens !== undefined) {
					this.lastRequestOutputTokens = finishChunk.totalUsage.outputTokens;
				}
				if (this.lastEstimatedInputTokens > 0 && this.lastRequestInputTokens !== null) {
					const newFactor = this.lastRequestInputTokens / this.lastEstimatedInputTokens;
					this.correctionFactor = this.correctionFactor * 0.7 + newFactor * 0.3;
					console.debug(
						`[VercelAI] Correction factor updated: ${this.correctionFactor.toFixed(3)}`,
					);
				}
				break;
			}

			// Text lifecycle markers
			case "text-start":
			case "text-end":
				break;

			// Reasoning lifecycle
			case "reasoning-start":
			case "reasoning-end":
				break;

			// Source references - no VS Code equivalent
			case "source":
				break;

			// Tool results would only come if we had execute functions
			case "tool-result":
				break;

			// Tool input lifecycle - we wait for complete tool-call
			case "tool-input-start":
			case "tool-input-delta":
				break;

			default:
				this.handleUnknownChunk(chunk, progress);
				break;
		}
	}

	/**
	 * Handle reasoning chunks using the unstable LanguageModelThinkingPart.
	 *
	 * This constructor is not in the stable VS Code API, so we use dynamic lookup.
	 * If the constructor doesn't exist, the reasoning content is silently skipped
	 * (there's no equivalent stable API surface).
	 */
	private handleReasoningChunk(
		chunk: { type: "reasoning-delta"; text: string },
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

		// fullStream TextStreamPart uses 'text' field for reasoning-delta
		if (ThinkingCtor && chunk.text) {
			progress.report(
				new (ThinkingCtor as new (text: string) => LanguageModelResponsePart)(chunk.text),
			);
		}
		// If ThinkingCtor doesn't exist, silently skip - no stable API equivalent
	}

	/**
	 * Handle tool-call chunks from the AI SDK stream.
	 *
	 * When tools are defined without execute functions, the SDK emits tool-call
	 * events that we forward to VS Code as LanguageModelToolCallPart.
	 * VS Code then handles tool execution and sends results back.
	 */
	private handleToolCall(
		chunk: {
			type: "tool-call";
			toolCallId: string;
			toolName: string;
			input: unknown;
		},
		progress: Progress<LanguageModelResponsePart>,
	): void {
		progress.report(
			new LanguageModelToolCallPart(
				chunk.toolCallId,
				chunk.toolName,
				chunk.input as Record<string, unknown>,
			),
		);
	}

	/**
	 * Handle file chunks by mapping to LanguageModelDataPart.
	 *
	 * fullStream provides files with a GeneratedFile object containing:
	 * - base64: string (base64 encoded content)
	 * - uint8Array: Uint8Array (binary content)
	 * - mediaType: string (MIME type)
	 *
	 * We use the appropriate LanguageModelDataPart factory method based on the media type:
	 * - Images: LanguageModelDataPart.image()
	 * - Text: LanguageModelDataPart.text()
	 * - JSON: LanguageModelDataPart.json()
	 * - Other: Raw LanguageModelDataPart constructor
	 */
	private handleFileChunk(
		chunk: {
			type: "file";
			file: { base64: string; uint8Array: Uint8Array; mediaType: string };
		},
		progress: Progress<LanguageModelResponsePart>,
	): void {
		const mimeType = chunk.file?.mediaType;
		if (!mimeType || !isValidMimeType(mimeType)) {
			console.warn(`[VercelAI] Unsupported file mime type: ${mimeType ?? "unknown"}`);
			return;
		}

		try {
			const dataPart = this.createDataPartForMimeType(chunk.file.uint8Array, mimeType);
			progress.report(dataPart);
		} catch (error) {
			console.warn("[VercelAI] Failed to process file chunk:", error);
		}
	}

	/**
	 * Create the appropriate LanguageModelDataPart based on MIME type.
	 */
	private createDataPartForMimeType(data: Uint8Array, mimeType: string): LanguageModelDataPart {
		// Use image() for image types to preserve binary data
		if (mimeType.startsWith("image/")) {
			return LanguageModelDataPart.image(data, mimeType);
		}

		// Use json() for JSON content
		if (mimeType === "application/json" || mimeType.endsWith("+json")) {
			try {
				const jsonValue = JSON.parse(new TextDecoder().decode(data));
				return LanguageModelDataPart.json(jsonValue, mimeType);
			} catch {
				// Fall through to text if JSON parsing fails
			}
		}

		// Use text() for text types
		if (
			mimeType.startsWith("text/") ||
			mimeType === "application/xml" ||
			mimeType.endsWith("+xml")
		) {
			return LanguageModelDataPart.text(new TextDecoder().decode(data), mimeType);
		}

		// For other types, use raw constructor
		return new LanguageModelDataPart(data, mimeType);
	}

	/**
	 * Handle error chunks by emitting a formatted error message as text.
	 */
	private handleErrorChunk(
		chunk: { type: "error"; error: unknown },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		const errorMessage =
			chunk.error instanceof Error
				? chunk.error.message
				: chunk.error
					? String(chunk.error)
					: "Unknown error occurred";
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

export function convertMessages(messages: readonly LanguageModelChatMessage[]): ModelMessage[] {
	// First pass: build a mapping of toolCallId -> toolName from all tool call parts
	const toolNameMap: Record<string, string> = {};
	for (const msg of messages) {
		for (const part of msg.content) {
			if (part instanceof LanguageModelToolCallPart) {
				toolNameMap[part.callId] = part.name;
			}
		}
	}

	// Second pass: convert messages, passing the tool name map for result lookups
	const result = messages
		.flatMap((msg) => convertSingleMessage(msg, toolNameMap))
		.filter(isValidMessage);
	fixSystemMessages(result);
	return result;
}

export function convertSingleMessage(
	msg: LanguageModelChatMessage,
	toolNameMap: Record<string, string>,
): ModelMessage[] {
	const results: ModelMessage[] = [];
	const role = msg.role === LanguageModelChatMessageRole.User ? "user" : "assistant";

	// Collect multi-modal content parts for a single message
	const contentParts: Array<{
		type: string;
		text?: string;
		image?: string;
		mimeType?: string;
	}> = [];

	for (const part of msg.content) {
		if (typeof part === "object" && part !== null) {
			if (isTextPart(part)) {
				contentParts.push({ type: "text", text: part.value });
			} else if (part instanceof LanguageModelDataPart) {
				if (part.mimeType.startsWith("image/")) {
					// Handle image parts - convert to base64 data URL for Vercel AI SDK
					const base64Data = Buffer.from(part.data).toString("base64");
					const dataUrl = `data:${part.mimeType};base64,${base64Data}`;
					contentParts.push({
						type: "image",
						image: dataUrl,
						mimeType: part.mimeType,
					});
				} else {
					const decodedText = new TextDecoder().decode(part.data);
					contentParts.push({ type: "text", text: decodedText });
				}
			} else if (part instanceof LanguageModelToolCallPart) {
				// Flush any accumulated content parts first
				if (contentParts.length > 0) {
					results.push(createMultiModalMessage(role, contentParts));
					contentParts.length = 0;
				}
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
			} else if (part instanceof LanguageModelToolResultPart) {
				// Flush any accumulated content parts first
				if (contentParts.length > 0) {
					results.push(createMultiModalMessage(role, contentParts));
					contentParts.length = 0;
				}
				const resultTexts = extractToolResultTexts(part);
				if (resultTexts.length > 0) {
					// Look up the tool name from the mapping built in convertMessages
					const toolName = toolNameMap[part.callId] || "unknown_tool";
					if (!toolNameMap[part.callId]) {
						console.warn(`[VercelAI] No tool name found for callId ${part.callId}, using fallback`);
					}
					results.push({
						role: "tool",
						content: [
							{
								type: "tool-result" as const,
								toolCallId: part.callId,
								toolName,
								output: {
									type: "text" as const,
									value: resultTexts.join(" "),
								},
							},
						],
					});
				}
			}
		}
	}

	// Flush any remaining content parts
	if (contentParts.length > 0) {
		results.push(createMultiModalMessage(role, contentParts));
	}

	if (results.length === 0) {
		console.debug("[VercelAI] Message had no valid content, creating placeholder");
		results.push({ role, content: "" });
	}

	return results;
}

/**
 * Create a multi-modal message from content parts.
 * If there's only text, return a simple string content.
 * If there are images, return an array of content parts.
 *
 * Note: Images can only be in user messages per the Vercel AI SDK.
 * If images appear in assistant/system messages, they will be converted to
 * text placeholders.
 */
function createMultiModalMessage(
	role: "user" | "assistant" | "system",
	parts: Array<{
		type: string;
		text?: string;
		image?: string;
		mimeType?: string;
	}>,
): ModelMessage {
	// If only text parts, combine into a single string
	const textOnly = parts.every((p) => p.type === "text");
	if (textOnly) {
		return {
			role,
			content: parts.map((p) => p.text).join(""),
		};
	}

	// Images can only be in user messages
	if (role === "user") {
		return {
			role: "user" as const,
			content: parts.map((p) => {
				if (p.type === "text") {
					return { type: "text" as const, text: p.text! };
				}
				return { type: "image" as const, image: p.image! };
			}),
		};
	}

	// For non-user roles, convert images to placeholder text
	console.warn(
		`[VercelAI] Images in ${role} messages are not supported, converting to placeholder`,
	);
	return {
		role,
		content: parts.map((p) => (p.type === "text" ? p.text : "[Image content]")).join(""),
	};
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
