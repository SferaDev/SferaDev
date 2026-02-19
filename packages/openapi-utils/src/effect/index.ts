import { Context, Effect, Layer, Schema } from "effect";

// ============================================================================
// Re-export errors, ApiConfig, and proxy utilities
// ============================================================================

export { ApiConfig, ApiError, makeApiLayer, NetworkError, ValidationError } from "./errors";
export type { EffectApi, EffectByPath } from "./proxy";
export { createEffectApi, createEffectByPath } from "./proxy";

// ============================================================================
// Configuration Schema
// ============================================================================

/**
 * Schema for API client configuration.
 * Provides runtime validation and type inference.
 */
export const ApiClientConfig = Schema.Struct({
	/** Base URL for the API */
	baseUrl: Schema.String,
	/** Bearer token for authentication */
	token: Schema.optional(Schema.String),
	/** Additional headers to include in all requests */
	headers: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
	/** Request timeout in milliseconds */
	timeout: Schema.optional(Schema.Number),
});

export type ApiClientConfig = typeof ApiClientConfig.Type;

/**
 * Schema for API client request options.
 */
export const ApiClientRequest = Schema.Struct({
	method: Schema.String,
	url: Schema.String,
	body: Schema.optional(Schema.Unknown),
	headers: Schema.optional(
		Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number) }),
	),
});

export type ApiClientRequest = typeof ApiClientRequest.Type;

// ============================================================================
// API Client Service (legacy — kept for backwards compatibility)
// ============================================================================

import { ApiError, NetworkError, ValidationError } from "./errors";

/**
 * API client service interface for making HTTP requests.
 * @deprecated Use ApiConfig with proxy-based Effect APIs instead.
 */
export type ApiClientService = {
	readonly request: <T>(
		options: ApiClientRequest,
	) => Effect.Effect<T, ApiError | NetworkError | ValidationError>;
};

/**
 * Effect Context tag for the API client service.
 * @deprecated Use ApiConfig with proxy-based Effect APIs instead.
 */
export class ApiClient extends Context.Tag("ApiClient")<ApiClient, ApiClientService>() {}

// ============================================================================
// Query Parameter Serialization
// ============================================================================

/**
 * Serialize query parameters to a URLSearchParams string.
 * Handles arrays, nested objects, and undefined values.
 */
export function serializeQueryParams(params: Record<string, unknown> | undefined): string {
	if (!params) return "";

	const searchParams = new URLSearchParams();

	const appendParam = (key: string, value: unknown): void => {
		if (value === undefined || value === null) return;

		if (Array.isArray(value)) {
			for (const item of value) {
				if (item !== undefined && item !== null) {
					searchParams.append(key, String(item));
				}
			}
		} else if (typeof value === "object") {
			for (const [nestedKey, nestedValue] of Object.entries(value)) {
				appendParam(`${key}[${nestedKey}]`, nestedValue);
			}
		} else {
			searchParams.append(key, String(value));
		}
	};

	for (const [key, value] of Object.entries(params)) {
		appendParam(key, value);
	}

	return searchParams.toString();
}

// ============================================================================
// API Client Implementation (legacy — kept for backwards compatibility)
// ============================================================================

/**
 * Create a live implementation of the API client.
 * @deprecated Use makeApiLayer with proxy-based Effect APIs instead.
 */
export const makeApiClientLive = (config: {
	baseUrl: string;
	token?: string;
	headers?: Record<string, string>;
	timeout?: number;
}): Layer.Layer<ApiClient> => {
	const validatedConfig = Schema.decodeUnknownSync(ApiClientConfig)(config);

	return Layer.succeed(
		ApiClient,
		ApiClient.of({
			request: <T>(
				options: ApiClientRequest,
			): Effect.Effect<T, ApiError | NetworkError | ValidationError> =>
				Effect.tryPromise({
					try: async () => {
						const stringifyHeaders = (
							headers: Record<string, string | number> | undefined,
						): Record<string, string> => {
							if (!headers) return {};
							return Object.fromEntries(
								Object.entries(headers).map(([key, value]) => [key, String(value)]),
							);
						};

						const headers: HeadersInit = {
							"Content-Type": "application/json",
							...validatedConfig.headers,
							...stringifyHeaders(options.headers),
						};

						if (validatedConfig.token) {
							(headers as Record<string, string>).Authorization = `Bearer ${validatedConfig.token}`;
						}

						if (
							typeof headers === "object" &&
							"Content-Type" in headers &&
							String(headers["Content-Type"]).includes("multipart/form-data")
						) {
							delete (headers as Record<string, string>)["Content-Type"];
						}

						const body =
							options.body instanceof FormData
								? options.body
								: options.body !== undefined
									? JSON.stringify(options.body)
									: undefined;

						const fullUrl = `${validatedConfig.baseUrl}${options.url}`;

						const controller = new AbortController();
						let timeoutId: ReturnType<typeof setTimeout> | undefined;

						if (validatedConfig.timeout) {
							timeoutId = setTimeout(() => controller.abort(), validatedConfig.timeout);
						}

						try {
							const response = await fetch(fullUrl, {
								method: options.method,
								headers,
								body,
								signal: controller.signal,
							});

							if (!response.ok) {
								let errorPayload: unknown;
								try {
									errorPayload = await response.json();
								} catch {
									errorPayload = { message: await response.text() };
								}
								throw new ApiError({ status: response.status, error: errorPayload });
							}

							const contentType = response.headers.get("content-type");
							if (contentType?.includes("application/json")) {
								return (await response.json()) as T;
							}
							return (await response.text()) as unknown as T;
						} finally {
							if (timeoutId) {
								clearTimeout(timeoutId);
							}
						}
					},
					catch: (error) => {
						if (error instanceof ApiError) {
							return error;
						}
						if (error instanceof ValidationError) {
							return error;
						}
						return new NetworkError({ cause: error });
					},
				}),
		}),
	);
};

// ============================================================================
// Cached API Client (legacy)
// ============================================================================

let cachedEnvLayer: Layer.Layer<ApiClient> | null = null;

/**
 * @deprecated Use makeApiLayer with proxy-based Effect APIs instead.
 */
export const makeApiClientFromEnv = (
	envTokenKey: string,
	baseUrl: string,
): Layer.Layer<ApiClient> => {
	if (cachedEnvLayer) {
		return cachedEnvLayer;
	}

	const token = typeof process !== "undefined" ? process.env?.[envTokenKey] : undefined;
	cachedEnvLayer = makeApiClientLive({ baseUrl, token });
	return cachedEnvLayer;
};

// ============================================================================
// Utility Functions (legacy)
// ============================================================================

/**
 * @deprecated Use makeApiLayer with proxy-based Effect APIs instead.
 */
export const runWithClient = <A, E>(
	config: {
		baseUrl: string;
		token?: string;
		headers?: Record<string, string>;
		timeout?: number;
	},
	effect: Effect.Effect<A, E, ApiClient>,
): Promise<A> => {
	return effect.pipe(Effect.provide(makeApiClientLive(config)), Effect.runPromise);
};

/**
 * @deprecated Use makeApiLayer with proxy-based Effect APIs instead.
 */
export const createClient = (config: {
	baseUrl: string;
	token?: string;
	headers?: Record<string, string>;
	timeout?: number;
}) => {
	const layer = makeApiClientLive(config);

	return {
		run: <A, E>(effect: Effect.Effect<A, E, ApiClient>): Promise<A> =>
			effect.pipe(Effect.provide(layer), Effect.runPromise),

		runExit: <A, E>(effect: Effect.Effect<A, E, ApiClient>) =>
			effect.pipe(Effect.provide(layer), Effect.runPromiseExit),

		layer,
	};
};
