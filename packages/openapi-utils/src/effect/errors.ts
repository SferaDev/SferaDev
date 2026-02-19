import { Context, Data, Layer } from "effect";

// ============================================================================
// Error Types
// ============================================================================

/**
 * Validation error for client-side input validation failures.
 * Use this for missing required parameters or invalid input formats.
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
	readonly field: string;
	readonly reason: string;
}> {
	override get message(): string {
		return `Validation error for '${this.field}': ${this.reason}`;
	}
}

/**
 * API error with status code and error payload.
 * Uses Effect's Data.TaggedError for pattern matching support.
 */
export class ApiError extends Data.TaggedError("ApiError")<{
	readonly status: number;
	readonly error: unknown;
}> {
	override get message(): string {
		if (this.error && typeof this.error === "object" && "message" in this.error) {
			return String((this.error as { message: unknown }).message);
		}
		return `API Error: ${this.status}`;
	}
}

/**
 * Network error for fetch failures (timeouts, DNS errors, etc).
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
	readonly cause: unknown;
}> {
	override get message(): string {
		if (this.cause instanceof Error) {
			return `Network error: ${this.cause.message}`;
		}
		return "Network error";
	}
}

// ============================================================================
// ApiConfig — Lightweight context tag for proxy-based Effect APIs
// ============================================================================

/**
 * Effect Context tag for API configuration.
 * Used by the proxy-based Effect API to inject config into operations.
 */
export class ApiConfig extends Context.Tag("ApiConfig")<
	ApiConfig,
	{
		token?: string;
		baseUrl?: string;
		fetchImpl?: (url: string, init?: any) => Promise<any>;
		headers?: Record<string, string>;
	}
>() {}

/**
 * Create a Layer providing ApiConfig values.
 */
export const makeApiLayer = (config: {
	token?: string;
	baseUrl?: string;
	headers?: Record<string, string>;
}): Layer.Layer<ApiConfig> => Layer.succeed(ApiConfig, config);
