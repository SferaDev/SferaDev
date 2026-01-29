export const EXTENSION_ID = "vercelAiGateway";
export const DEFAULT_BASE_URL = "https://ai-gateway.vercel.sh";
export const MODELS_ENDPOINT = "/v1/models";
export const MODELS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const ENRICHMENT_ENDPOINT_PATTERN = "/v1/models";
export const ENRICHMENT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const TOKEN_REFRESH_MARGIN = 15 * 60 * 1000; // 15 minutes
export const LAST_SELECTED_MODEL_KEY = "vercelAiGateway.lastSelectedModel";
export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_REASONING_EFFORT = "medium" as const;
export const DEFAULT_SYSTEM_PROMPT_MESSAGE =
	"You are being accessed through the Vercel AI Gateway VS Code extension. The user is interacting with you via VS Code's chat interface.";

// Token estimation constants
/** Overhead tokens per message for structural formatting (~4 tokens/message) */
export const MESSAGE_OVERHEAD_TOKENS = 4;
/** Multiplier applied to token estimates after learning from "input too long" errors */
export const LEARNED_TOKEN_CORRECTION_MULTIPLIER = 1.5;
/** Threshold (as fraction of max) above which to warn about token usage */
export const TOKEN_WARNING_THRESHOLD = 0.9;

// Safety margin constants for token estimation
/** Safety margin for cached/actual token counts (2%) */
export const SAFETY_MARGIN_CACHED = 0.02;
/** Safety margin for tiktoken-estimated counts (5%) */
export const SAFETY_MARGIN_ESTIMATED = 0.05;
/** Safety margin for character-based fallback estimates (10%) */
export const SAFETY_MARGIN_CHARACTER_FALLBACK = 0.1;

export const ERROR_MESSAGES = {
	AUTH_FAILED: "Failed to authenticate with Vercel AI Gateway. Please try again.",
	API_KEY_NOT_FOUND: "Vercel AI Gateway API key not found",
	VERCEL_CLI_NOT_LOGGED_IN: "Vercel CLI not logged in. Please run `vercel login` first.",
	MODELS_FETCH_FAILED: "Failed to fetch models from Vercel AI Gateway",
} as const;
