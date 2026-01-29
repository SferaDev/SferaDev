/**
 * Logging utilities for the Vercel AI Gateway extension.
 *
 * Uses VS Code's native LogOutputChannel for structured logging with
 * automatic level filtering, timestamping, and storage management.
 */

import * as vscode from "vscode";

export type LogLevel = "off" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * Shared log output channel instance.
 * Initialized by initializeLogger() which should be called once from activate().
 */
let _logChannel: vscode.LogOutputChannel | null = null;

/**
 * Initialize the shared log output channel.
 * Call this ONCE from extension activate() and add the returned disposable to context.subscriptions.
 */
export function initializeLogger(): vscode.Disposable {
	if (_logChannel) {
		return { dispose: () => {} };
	}

	try {
		_logChannel = vscode.window.createOutputChannel("Vercel AI Gateway", { log: true });
	} catch {
		// Fallback for environments where LogOutputChannel isn't available
		return { dispose: () => {} };
	}

	return {
		dispose: () => {
			_logChannel?.dispose();
			_logChannel = null;
		},
	};
}

/**
 * Reset the logger singleton (for testing only).
 * @internal
 */
export function _resetLoggerForTesting(): void {
	_logChannel?.dispose();
	_logChannel = null;
}

/**
 * Get the current log output channel, if initialized.
 */
export function getLogChannel(): vscode.LogOutputChannel | null {
	return _logChannel;
}

// Main logger export - proxies to the shared LogOutputChannel
export const logger = {
	error(message: string, ...args: unknown[]): void {
		_logChannel?.error(message, ...args);
	},
	warn(message: string, ...args: unknown[]): void {
		_logChannel?.warn(message, ...args);
	},
	info(message: string, ...args: unknown[]): void {
		_logChannel?.info(message, ...args);
	},
	debug(message: string, ...args: unknown[]): void {
		_logChannel?.debug(message, ...args);
	},
	trace(message: string, ...args: unknown[]): void {
		_logChannel?.trace(message, ...args);
	},
	show(): void {
		_logChannel?.show();
	},
};

/**
 * Log detailed error information for debugging.
 */
export function logError(context: string, error: unknown): void {
	logger.error(`${context}:`, error);

	if (error && typeof error === "object") {
		const errorObj = error as Record<string, unknown>;
		const details: Record<string, unknown> = {};

		if ("name" in errorObj) details.name = errorObj.name;
		if ("message" in errorObj) details.message = errorObj.message;
		if ("statusCode" in errorObj) details.statusCode = errorObj.statusCode;
		if ("status" in errorObj) details.status = errorObj.status;
		if ("responseBody" in errorObj) details.responseBody = errorObj.responseBody;
		if ("url" in errorObj) details.url = errorObj.url;
		if ("cause" in errorObj) details.cause = errorObj.cause;

		if (Object.keys(details).length > 0) {
			logger.debug(`${context} - Details:`, details);
		}

		if (error instanceof Error && error.stack) {
			logger.trace(`${context} - Stack:`, error.stack);
		}
	}
}

/**
 * Clean up error messages that have malformed prefixes like "undefined: ".
 */
function cleanErrorMessage(message: string): string {
	return message.replace(/^undefined:\s*/i, "");
}

/**
 * Extract a user-friendly error message from various error types.
 */
export function extractErrorMessage(error: unknown): string {
	if (error && typeof error === "object") {
		const errorObj = error as Record<string, unknown>;

		if ("responseBody" in errorObj && typeof errorObj.responseBody === "string") {
			try {
				const parsed = JSON.parse(errorObj.responseBody);
				const attempts = parsed.providerMetadata?.gateway?.routing?.attempts;
				if (Array.isArray(attempts)) {
					for (const attempt of attempts) {
						if (attempt.error && typeof attempt.error === "string") {
							const cleaned = cleanErrorMessage(attempt.error);
							if (
								cleaned.includes("tokens") ||
								cleaned.includes("too long") ||
								cleaned.includes("exceeds")
							) {
								return cleaned;
							}
						}
					}
					const firstError = attempts[0]?.error;
					if (firstError && typeof firstError === "string") {
						return cleanErrorMessage(firstError);
					}
				}

				if (parsed.error?.message) {
					return cleanErrorMessage(parsed.error.message);
				}
			} catch {
				// Fall through
			}
		}

		if ("message" in errorObj && typeof errorObj.message === "string") {
			return cleanErrorMessage(errorObj.message);
		}
	}

	if (error instanceof Error) {
		return cleanErrorMessage(error.message);
	}

	if (typeof error === "string") {
		return cleanErrorMessage(error);
	}

	return "An unexpected error occurred";
}

export interface ExtractedTokenInfo {
	actualTokens: number;
	maxTokens?: number;
}

/**
 * Extract actual token count from "input too long" error messages.
 */
export function extractTokenCountFromError(error: unknown): ExtractedTokenInfo | undefined {
	const message = extractErrorMessage(error);

	const tokenPattern = /(\d+)\s*tokens?\s*>\s*(\d+)/i;
	const match = message.match(tokenPattern);

	if (match) {
		const actualTokens = parseInt(match[1], 10);
		const maxTokens = parseInt(match[2], 10);
		if (!Number.isNaN(actualTokens) && actualTokens > 0) {
			return {
				actualTokens,
				maxTokens: !Number.isNaN(maxTokens) ? maxTokens : undefined,
			};
		}
	}

	const exceedsPattern = /exceeds.*?(\d+)\s*tokens?/i;
	const exceedsMatch = message.match(exceedsPattern);
	if (exceedsMatch) {
		const maxTokens = parseInt(exceedsMatch[1], 10);
		if (!Number.isNaN(maxTokens)) {
			return { actualTokens: maxTokens + 1, maxTokens };
		}
	}

	return undefined;
}
