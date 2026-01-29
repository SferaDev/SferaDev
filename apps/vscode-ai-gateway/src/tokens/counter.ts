import { getEncoding, type Tiktoken } from "js-tiktoken";
import { LRUCache } from "lru-cache";
import * as vscode from "vscode";

const CHARS_PER_TOKEN = 3.5;
const SYSTEM_PROMPT_OVERHEAD = 28;
const TOOLS_BASE_OVERHEAD = 16;
const PER_TOOL_OVERHEAD = 8;
const TOOL_SAFETY_MULTIPLIER = 1.1;

/** Maximum text length to use as cache key directly */
const MAX_DIRECT_KEY_LENGTH = 200;

export class TokenCounter {
	private encodings = new Map<string, Tiktoken>();
	private textCache = new LRUCache<string, number>({ max: 5000 });

	estimateTextTokens(text: string, modelFamily: string): number {
		if (!text) return 0;

		const cacheKey = this.getCacheKey(text, modelFamily);
		const cached = this.textCache.get(cacheKey);
		if (cached !== undefined) return cached;

		const encoding = this.getEncoding(modelFamily);
		const count = encoding
			? encoding.encode(text).length
			: Math.ceil(text.length / CHARS_PER_TOKEN);

		this.textCache.set(cacheKey, count);
		return count;
	}

	estimateMessageTokens(message: vscode.LanguageModelChatMessage, modelFamily: string): number {
		let total = 0;

		for (const part of message.content) {
			if (part instanceof vscode.LanguageModelTextPart) {
				total += this.estimateTextTokens(part.value, modelFamily);
			} else if (part instanceof vscode.LanguageModelDataPart) {
				if (part.mimeType.startsWith("image/")) {
					total += this.estimateImageTokens(modelFamily, part.data.byteLength);
				} else {
					total += this.estimateTextTokens(new TextDecoder().decode(part.data), modelFamily);
				}
			} else if (part instanceof vscode.LanguageModelToolCallPart) {
				total +=
					this.estimateTextTokens(
						`${part.name}\n${JSON.stringify(part.input ?? {})}`,
						modelFamily,
					) + 4;
			} else if (part instanceof vscode.LanguageModelToolResultPart) {
				total += this.estimateToolResultTokens(part, modelFamily);
			}
		}

		return total;
	}

	countToolsTokens(
		tools: readonly { name: string; description?: string; inputSchema?: unknown }[] | undefined,
		modelFamily: string,
	): number {
		if (!tools || tools.length === 0) return 0;

		let tokens = TOOLS_BASE_OVERHEAD;
		for (const tool of tools) {
			tokens += PER_TOOL_OVERHEAD;
			tokens += this.estimateTextTokens(tool.name, modelFamily);
			tokens += this.estimateTextTokens(tool.description || "", modelFamily);
			tokens += this.estimateTextTokens(JSON.stringify(tool.inputSchema ?? {}), modelFamily);
		}

		return Math.ceil(tokens * TOOL_SAFETY_MULTIPLIER);
	}

	countSystemPromptTokens(systemPrompt: string | undefined, modelFamily: string): number {
		if (!systemPrompt) return 0;
		return this.estimateTextTokens(systemPrompt, modelFamily) + SYSTEM_PROMPT_OVERHEAD;
	}

	private getCacheKey(text: string, modelFamily: string): string {
		// For short texts, use directly as key (fast path)
		if (text.length <= MAX_DIRECT_KEY_LENGTH) {
			return `${modelFamily}:${text}`;
		}
		// For longer texts, use length + first/last chars as a fingerprint
		// This is a reasonable tradeoff between collisions and performance
		const prefix = text.slice(0, 50);
		const suffix = text.slice(-50);
		return `${modelFamily}:${text.length}:${prefix}:${suffix}`;
	}

	private estimateToolResultTokens(
		part: vscode.LanguageModelToolResultPart,
		modelFamily: string,
	): number {
		let total = 4;
		for (const resultPart of part.content) {
			if (typeof resultPart === "object" && resultPart !== null && "value" in resultPart) {
				total += this.estimateTextTokens(
					String((resultPart as { value: unknown }).value),
					modelFamily,
				);
			}
		}
		return total;
	}

	private estimateImageTokens(modelFamily: string, dataSize: number): number {
		const family = modelFamily.toLowerCase();

		// Anthropic uses fixed token count for images (conservative estimate)
		if (family.includes("anthropic") || family.includes("claude")) {
			return 1600;
		}

		// OpenAI tile-based calculation (simplified)
		const estimatedDimension = Math.sqrt(dataSize / 3);
		const scaledDimension = Math.min(estimatedDimension, 2048);
		const tiles = Math.ceil(scaledDimension / 512) ** 2;
		return Math.min(85 + tiles * 85, 1700);
	}

	private getEncoding(modelFamily: string): Tiktoken | undefined {
		const name = this.resolveEncodingName(modelFamily);

		const cached = this.encodings.get(name);
		if (cached) return cached;

		try {
			const encoding = getEncoding(name);
			this.encodings.set(name, encoding);
			return encoding;
		} catch {
			return undefined;
		}
	}

	private resolveEncodingName(modelFamily: string): "o200k_base" | "cl100k_base" {
		const family = modelFamily.toLowerCase();
		if (family.includes("gpt-4o") || family.includes("o1") || family.includes("o3")) {
			return "o200k_base";
		}
		return "cl100k_base";
	}
}
