import { createGatewayProvider } from "@ai-sdk/gateway";
import type { SharedV3ProviderOptions } from "@ai-sdk/provider";
import { jsonSchema, type ModelMessage, streamText, type TextStreamPart, type ToolSet } from "ai";
import { LRUCache } from "lru-cache";
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

import { VERCEL_AI_AUTH_PROVIDER_ID } from "./auth";
import { ConfigService } from "./config";
import {
	DEFAULT_SYSTEM_PROMPT_MESSAGE,
	ERROR_MESSAGES,
	LAST_SELECTED_MODEL_KEY,
	MESSAGE_OVERHEAD_TOKENS,
	TOKEN_WARNING_THRESHOLD,
} from "./constants";
import { extractErrorMessage, logError, logger } from "./logger";
import { ModelsClient } from "./models";
import { type EnrichedModelData, ModelEnricher } from "./models/enrichment";
import { parseModelIdentity } from "./models/identity";
import { TokenCounter } from "./tokens/counter";

type StreamChunk = TextStreamPart<ToolSet>;

const MIME_TYPE_PATTERN = /^[a-z]+\/[a-z0-9.+-]+$/i;

export function isValidMimeType(mimeType: string): boolean {
	return MIME_TYPE_PATTERN.test(mimeType);
}

export class VercelAIChatModelProvider implements LanguageModelChatProvider {
	private context: ExtensionContext;
	private modelsClient: ModelsClient;
	private tokenCounter: TokenCounter;
	private correctionFactor = 1.0;
	private lastEstimatedInputTokens = 0;
	private configService: ConfigService;
	private enricher: ModelEnricher;
	private enrichedModels = new LRUCache<string, EnrichedModelData>({ max: 200 });
	private readonly modelInfoChangeEmitter = new vscode.EventEmitter<void>();
	readonly onDidChangeLanguageModelChatInformation = this.modelInfoChangeEmitter.event;

	constructor(context: ExtensionContext, configService: ConfigService = new ConfigService()) {
		this.context = context;
		this.configService = configService;
		this.modelsClient = new ModelsClient(configService);
		this.tokenCounter = new TokenCounter();
		this.enricher = new ModelEnricher(configService);
		this.enricher.initializePersistence(context.globalState);
	}

	dispose(): void {
		this.modelInfoChangeEmitter.dispose();
	}

	async provideLanguageModelChatInformation(
		options: { silent: boolean },
		_token: CancellationToken,
	): Promise<LanguageModelChatInformation[]> {
		logger.debug("Fetching available models", { silent: options.silent });
		const apiKey = await this.getApiKey(options.silent);
		if (!apiKey) {
			logger.debug("No API key available, returning empty model list");
			return [];
		}

		try {
			const models = await this.modelsClient.getModels(apiKey);
			logger.info(`Loaded ${models.length} models from Vercel AI Gateway`);

			if (this.configService.modelsEnrichmentEnabled) {
				const enrichedModels = this.applyEnrichmentToModels(models);
				this.triggerBackgroundEnrichment(models, apiKey);
				return enrichedModels;
			}

			return models;
		} catch (error) {
			logger.error(ERROR_MESSAGES.MODELS_FETCH_FAILED, error);
			return [];
		}
	}

	private applyEnrichmentToModels(
		models: LanguageModelChatInformation[],
	): LanguageModelChatInformation[] {
		return models.map((model) => {
			const enriched = this.enrichedModels.get(model.id);
			if (!enriched) return model;

			const hasContextChange =
				enriched.context_length && enriched.context_length !== model.maxInputTokens;
			const hasImageCapability = enriched.input_modalities?.includes("image");

			if (!hasContextChange && !hasImageCapability) return model;

			return {
				...model,
				maxInputTokens: hasContextChange ? enriched.context_length! : model.maxInputTokens,
				capabilities: hasImageCapability
					? { ...(model.capabilities ?? {}), imageInput: true }
					: model.capabilities,
			};
		});
	}

	private triggerBackgroundEnrichment(
		models: LanguageModelChatInformation[],
		apiKey: string,
	): void {
		const modelsToEnrich = models.filter((model) => !this.enrichedModels.has(model.id));
		if (modelsToEnrich.length === 0) return;

		Promise.allSettled(
			modelsToEnrich.map((model) => this.enrichModelIfNeeded(model.id, apiKey)),
		).then((results) => {
			const enrichedCount = results.filter(
				(result) => result.status === "fulfilled" && result.value,
			).length;

			if (enrichedCount > 0) {
				logger.debug(`Background enrichment completed for ${enrichedCount} models`);
				this.modelInfoChangeEmitter.fire();
			}
		});
	}

	async provideLanguageModelChatResponse(
		model: LanguageModelChatInformation,
		chatMessages: readonly LanguageModelChatMessage[],
		options: ProvideLanguageModelChatResponseOptions,
		progress: Progress<LanguageModelResponsePart>,
		token: CancellationToken,
	): Promise<void> {
		logger.info(`Chat request to ${model.id} with ${chatMessages.length} messages`);

		const abortController = new AbortController();
		const abortSubscription = token.onCancellationRequested(() => abortController.abort());
		let responseSent = false;

		try {
			const systemPrompt = this.getSystemPrompt();
			const estimatedTokens = this.estimateTotalInputTokens(model, chatMessages, {
				tools: options.tools,
				systemPrompt,
			});

			logger.debug(
				`Token estimate: ${estimatedTokens}/${model.maxInputTokens} (${Math.round((estimatedTokens / model.maxInputTokens) * 100)}%)`,
			);

			if (estimatedTokens > model.maxInputTokens * TOKEN_WARNING_THRESHOLD) {
				logger.warn(
					`Input is ${Math.round((estimatedTokens / model.maxInputTokens) * 100)}% of max tokens`,
				);
			}

			this.lastEstimatedInputTokens = estimatedTokens;

			const apiKey = await this.getApiKey(false);
			if (!apiKey) {
				throw new Error(ERROR_MESSAGES.API_KEY_NOT_FOUND);
			}

			if (this.configService.modelsEnrichmentEnabled) {
				await this.enrichModelIfNeeded(model.id, apiKey);
			}

			const gateway = createGatewayProvider({
				apiKey,
				baseURL: this.configService.gatewayBaseUrl,
			});

			const tools = this.buildToolSet(options.tools);
			const toolChoice = this.getToolChoice(options.toolMode, tools);
			const providerOptions = this.buildSharedV3ProviderOptions(model);

			const response = streamText({
				model: gateway(model.id),
				system: systemPrompt,
				messages: convertMessages(chatMessages),
				toolChoice,
				temperature: options.modelOptions?.temperature ?? 0.7,
				maxOutputTokens: options.modelOptions?.maxOutputTokens ?? 4096,
				tools: Object.keys(tools).length > 0 ? tools : undefined,
				abortSignal: abortController.signal,
				timeout: this.configService.timeout,
				providerOptions,
			});

			for await (const chunk of response.fullStream) {
				const emitted = this.handleStreamChunk(chunk, progress);
				if (emitted) responseSent = true;
			}

			if (!responseSent) {
				logger.error("Stream completed with no content");
				progress.report(new LanguageModelTextPart("**Error**: No response received from model."));
			}

			await this.context.workspaceState.update(LAST_SELECTED_MODEL_KEY, model.id);
			logger.info(`Chat request completed for ${model.id}`);
		} catch (error) {
			if (this.isAbortError(error)) {
				logger.debug("Request was cancelled");
				return;
			}

			logError("Exception during streaming", error);
			const errorMessage = extractErrorMessage(error);

			if (!responseSent) {
				logger.error(`Emitting error response: ${errorMessage}`);
			}
			progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`));
		} finally {
			abortSubscription.dispose();
		}
	}

	async provideTokenCount(
		model: LanguageModelChatInformation,
		text: string | LanguageModelChatMessage,
		_token: CancellationToken,
	): Promise<number> {
		if (typeof text === "string") {
			return Math.ceil(
				this.tokenCounter.estimateTextTokens(text, model.family) * this.correctionFactor,
			);
		}

		const estimated = this.tokenCounter.estimateMessageTokens(text, model.family);
		return Math.ceil(estimated * this.correctionFactor);
	}

	public getLastSelectedModelId(): string | undefined {
		return this.context.workspaceState.get<string>(LAST_SELECTED_MODEL_KEY);
	}

	public getEnrichedModelData(modelId: string): EnrichedModelData | undefined {
		return this.enrichedModels.get(modelId);
	}

	private getSystemPrompt(): string | undefined {
		if (!this.configService.systemPromptEnabled) return undefined;

		const message = this.configService.systemPromptMessage?.trim();
		return message || DEFAULT_SYSTEM_PROMPT_MESSAGE;
	}

	private buildToolSet(
		tools?: readonly { name: string; description?: string; inputSchema?: unknown }[],
	): ToolSet {
		const toolSet: ToolSet = {};
		for (const { name, description, inputSchema } of tools || []) {
			toolSet[name] = {
				description,
				inputSchema: jsonSchema(inputSchema || { type: "object", properties: {} }),
			} as ToolSet[string];
		}
		return toolSet;
	}

	private getToolChoice(
		toolMode: LanguageModelChatToolMode | undefined,
		tools: ToolSet,
	): "auto" | "required" | "none" {
		if (toolMode === LanguageModelChatToolMode.Required) return "required";
		if (Object.keys(tools).length === 0) return "none";
		return "auto";
	}

	private buildSharedV3ProviderOptions(
		model: LanguageModelChatInformation,
	): SharedV3ProviderOptions | undefined {
		const options: SharedV3ProviderOptions = {};

		if (this.isAnthropicModel(model)) {
			options.anthropic = { contextManagement: { enabled: true } };
		}

		const reasoningOptions = this.getReasoningEffortOptions(model);
		if (reasoningOptions) {
			options.openai = reasoningOptions;
		}

		return Object.keys(options).length > 0 ? options : undefined;
	}

	private isAnthropicModel(model: LanguageModelChatInformation): boolean {
		const identity = parseModelIdentity(model.id);
		const id = model.id.toLowerCase();
		return (
			identity.provider.toLowerCase() === "anthropic" ||
			id.includes("claude") ||
			id.includes("anthropic")
		);
	}

	private getReasoningEffortOptions(
		model: LanguageModelChatInformation,
	): { reasoningEffort: string } | undefined {
		const id = model.id.toLowerCase();
		const supportsReasoning = id.includes("o1") || id.includes("o3");
		if (!supportsReasoning) return undefined;

		return { reasoningEffort: this.configService.reasoningEffort };
	}

	private estimateTotalInputTokens(
		model: LanguageModelChatInformation,
		messages: readonly LanguageModelChatMessage[],
		options?: {
			tools?: readonly { name: string; description?: string; inputSchema?: unknown }[];
			systemPrompt?: string;
		},
	): number {
		let total = 0;

		for (const message of messages) {
			total += this.tokenCounter.estimateMessageTokens(message, model.family);
		}
		total += messages.length * MESSAGE_OVERHEAD_TOKENS;

		if (options?.tools && options.tools.length > 0) {
			total += this.tokenCounter.countToolsTokens(options.tools, model.family);
		}

		if (options?.systemPrompt) {
			total += this.tokenCounter.countSystemPromptTokens(options.systemPrompt, model.family);
		}

		return Math.ceil(total * this.correctionFactor);
	}

	private isAbortError(error: unknown): boolean {
		if (!(error instanceof Error)) return false;
		return (
			error.name === "AbortError" ||
			error.message.includes("aborted") ||
			error.message.includes("cancelled") ||
			error.message.includes("canceled")
		);
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
				logger.error("Failed to get authentication session:", error);
				window.showErrorMessage(ERROR_MESSAGES.AUTH_FAILED);
			}
			return undefined;
		}
	}

	private async enrichModelIfNeeded(modelId: string, apiKey: string): Promise<boolean> {
		if (this.enrichedModels.has(modelId)) return false;

		try {
			const enriched = await this.enricher.enrichModel(modelId, apiKey);
			if (enriched) {
				this.enrichedModels.set(modelId, enriched);
				logger.debug(`Enriched model ${modelId}`);
				return true;
			}
		} catch (error) {
			logger.warn(`Failed to enrich model ${modelId}`, error);
		}

		return false;
	}

	/**
	 * Handle a stream chunk and return whether content was emitted.
	 */
	private handleStreamChunk(
		chunk: StreamChunk,
		progress: Progress<LanguageModelResponsePart>,
	): boolean {
		switch (chunk.type) {
			case "text-delta": {
				const text =
					(chunk as { textDelta?: string; text?: string }).textDelta ??
					(chunk as { text?: string }).text;
				if (text) {
					progress.report(new LanguageModelTextPart(text));
					return true;
				}
				return false;
			}

			case "reasoning-delta":
				return this.handleReasoningChunk(chunk, progress);

			case "file":
				return this.handleFileChunk(chunk, progress);

			case "error":
				this.handleErrorChunk(chunk, progress);
				return true;

			case "tool-call":
				this.handleToolCall(chunk, progress);
				return true;

			case "finish":
				this.handleFinishChunk(chunk);
				return false;

			// Lifecycle events - no content
			case "start":
			case "start-step":
			case "finish-step":
			case "abort":
			case "text-start":
			case "text-end":
			case "reasoning-start":
			case "reasoning-end":
			case "source":
			case "tool-result":
			case "tool-input-start":
			case "tool-input-delta":
				return false;

			default:
				return false;
		}
	}

	private handleReasoningChunk(
		chunk: { type: "reasoning-delta"; delta?: string; text?: string },
		progress: Progress<LanguageModelResponsePart>,
	): boolean {
		const vsAny = vscode as Record<string, unknown>;
		const ThinkingCtor = vsAny.LanguageModelThinkingPart as
			| (new (
					text: string,
			  ) => LanguageModelResponsePart)
			| undefined;

		const text = chunk.delta ?? chunk.text;
		if (ThinkingCtor && text) {
			progress.report(new ThinkingCtor(text));
			return true;
		}
		return false;
	}

	private handleToolCall(
		chunk: { type: "tool-call"; toolCallId: string; toolName: string; args?: unknown },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		const input = (chunk.args ?? {}) as Record<string, unknown>;
		progress.report(new LanguageModelToolCallPart(chunk.toolCallId, chunk.toolName, input));
		logger.debug(`Tool call: ${chunk.toolName} (${chunk.toolCallId})`);
	}

	private handleFileChunk(
		chunk: { type: "file"; file: { uint8Array: Uint8Array; mediaType: string } },
		progress: Progress<LanguageModelResponsePart>,
	): boolean {
		const mimeType = chunk.file?.mediaType;
		if (!mimeType || !isValidMimeType(mimeType)) {
			logger.warn(`Unsupported file mime type: ${mimeType ?? "unknown"}`);
			return false;
		}

		try {
			const data = chunk.file.uint8Array;

			if (mimeType.startsWith("image/")) {
				progress.report(LanguageModelDataPart.image(data, mimeType));
			} else if (mimeType === "application/json" || mimeType.endsWith("+json")) {
				const jsonValue = JSON.parse(new TextDecoder().decode(data));
				progress.report(LanguageModelDataPart.json(jsonValue, mimeType));
			} else if (mimeType.startsWith("text/")) {
				progress.report(LanguageModelDataPart.text(new TextDecoder().decode(data), mimeType));
			} else {
				progress.report(new LanguageModelDataPart(data, mimeType));
			}
			return true;
		} catch (error) {
			logger.warn("Failed to process file chunk:", error);
			return false;
		}
	}

	private handleErrorChunk(
		chunk: { type: "error"; error: unknown },
		progress: Progress<LanguageModelResponsePart>,
	): void {
		logError("Stream error", chunk.error);
		const errorMessage = extractErrorMessage(chunk.error);
		progress.report(new LanguageModelTextPart(`\n\n**Error:** ${errorMessage}\n\n`));
	}

	private handleFinishChunk(chunk: StreamChunk): void {
		const finishChunk = chunk as { totalUsage?: { inputTokens?: number } };
		const actualInputTokens = finishChunk.totalUsage?.inputTokens;

		if (actualInputTokens !== undefined && this.lastEstimatedInputTokens > 0) {
			const newFactor = actualInputTokens / this.lastEstimatedInputTokens;
			this.correctionFactor = this.correctionFactor * 0.7 + newFactor * 0.3;
			logger.debug(`Correction factor: ${this.correctionFactor.toFixed(3)}`);
		}
	}
}

// Message conversion utilities

export function convertMessages(messages: readonly LanguageModelChatMessage[]): ModelMessage[] {
	const toolNameMap: Record<string, string> = {};
	for (const msg of messages) {
		for (const part of msg.content) {
			if (part instanceof LanguageModelToolCallPart) {
				toolNameMap[part.callId] = part.name;
			}
		}
	}

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
	const contentParts: Array<{ type: string; text?: string; image?: string }> = [];

	for (const part of msg.content) {
		if (typeof part !== "object" || part === null) continue;

		if (isTextPart(part)) {
			contentParts.push({ type: "text", text: part.value });
		} else if (part instanceof LanguageModelDataPart) {
			if (part.mimeType.startsWith("image/")) {
				const base64 = Buffer.from(part.data).toString("base64");
				contentParts.push({ type: "image", image: `data:${part.mimeType};base64,${base64}` });
			} else {
				contentParts.push({ type: "text", text: new TextDecoder().decode(part.data) });
			}
		} else if (part instanceof LanguageModelToolCallPart) {
			if (contentParts.length > 0) {
				results.push(createMessage(role, contentParts));
				contentParts.length = 0;
			}
			results.push({
				role: "assistant",
				content: [
					{ type: "tool-call", toolName: part.name, toolCallId: part.callId, input: part.input },
				],
			});
		} else if (part instanceof LanguageModelToolResultPart) {
			if (contentParts.length > 0) {
				results.push(createMessage(role, contentParts));
				contentParts.length = 0;
			}
			const texts = extractToolResultTexts(part);
			if (texts.length > 0) {
				const toolName = toolNameMap[part.callId] || "unknown_tool";
				results.push({
					role: "tool",
					content: [
						{
							type: "tool-result",
							toolCallId: part.callId,
							toolName,
							output: { type: "text", value: texts.join(" ") },
						},
					],
				});
			}
		}
	}

	if (contentParts.length > 0) {
		results.push(createMessage(role, contentParts));
	}

	if (results.length === 0) {
		results.push({ role, content: "" });
	}

	return results;
}

function createMessage(
	role: "user" | "assistant",
	parts: Array<{ type: string; text?: string; image?: string }>,
): ModelMessage {
	const textOnly = parts.every((p) => p.type === "text");
	if (textOnly) {
		return { role, content: parts.map((p) => p.text).join("") };
	}

	if (role === "user") {
		return {
			role: "user",
			content: parts.map((p) =>
				p.type === "text"
					? { type: "text" as const, text: p.text ?? "" }
					: { type: "image" as const, image: p.image ?? "" },
			),
		};
	}

	return { role, content: parts.map((p) => (p.type === "text" ? p.text : "[Image]")).join("") };
}

function isTextPart(part: object): part is { value: string } {
	return "value" in part && typeof (part as { value: unknown }).value === "string";
}

function extractToolResultTexts(part: LanguageModelToolResultPart): string[] {
	return part.content
		.filter((p): p is { value: string } => typeof p === "object" && p !== null && "value" in p)
		.map((p) => p.value);
}

function isValidMessage(msg: ModelMessage): boolean {
	if (typeof msg.content === "string") return msg.content.trim().length > 0;
	return Array.isArray(msg.content) && msg.content.length > 0;
}

function fixSystemMessages(result: ModelMessage[]): void {
	const firstUserIndex = result.findIndex((msg) => msg.role === "user");
	for (let i = 0; i < firstUserIndex; i++) {
		if (result[i].role === "assistant") {
			result[i].role = "system";
		}
	}
}
