/**
 * Logging utilities for the Vercel AI Gateway extension.
 *
 * Extracts detailed error information from AI SDK error types for debugging.
 */

/**
 * Log detailed error information for debugging.
 *
 * Extracts full context from AI SDK error types including:
 * - GatewayError: API response details, status codes, request info
 * - APICallError: Provider-specific error details
 * - Standard Error: Stack trace and message
 */
export function logError(context: string, error: unknown): void {
	console.error(`[VercelAI] ${context}:`, error);

	if (error && typeof error === "object") {
		const errorObj = error as Record<string, unknown>;

		// Log structured error details if available
		const details: Record<string, unknown> = {};

		if ("name" in errorObj) details.name = errorObj.name;
		if ("message" in errorObj) details.message = errorObj.message;
		if ("statusCode" in errorObj) details.statusCode = errorObj.statusCode;
		if ("status" in errorObj) details.status = errorObj.status;
		if ("responseBody" in errorObj) details.responseBody = errorObj.responseBody;
		if ("url" in errorObj) details.url = errorObj.url;
		if ("requestBodyValues" in errorObj) details.requestBodyValues = errorObj.requestBodyValues;
		if ("cause" in errorObj) details.cause = errorObj.cause;
		if ("data" in errorObj) details.data = errorObj.data;
		if ("generationId" in errorObj) details.generationId = errorObj.generationId;

		if (Object.keys(details).length > 0) {
			console.error(`[VercelAI] ${context} - Details:`, details);
		}

		// Log stack trace if available
		if (error instanceof Error && error.stack) {
			console.debug(`[VercelAI] ${context} - Stack:`, error.stack);
		}
	}
}

/**
 * Extract a user-friendly error message from various error types.
 */
export function extractErrorMessage(error: unknown): string {
	if (error && typeof error === "object") {
		const errorObj = error as Record<string, unknown>;

		// Try to extract message from response body (often contains more detail)
		if ("responseBody" in errorObj && typeof errorObj.responseBody === "string") {
			try {
				const parsed = JSON.parse(errorObj.responseBody);
				if (parsed.error?.message) {
					return parsed.error.message;
				}
			} catch {
				// Fall through to other extraction methods
			}
		}

		// Use error message if available
		if ("message" in errorObj && typeof errorObj.message === "string") {
			return errorObj.message;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unexpected error occurred";
}
