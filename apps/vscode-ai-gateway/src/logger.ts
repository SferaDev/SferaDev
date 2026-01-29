/**
 * Logging utilities for the Vercel AI Gateway extension.
 *
 * Provides configurable logging with level filtering and VS Code output channel support.
 * Optionally writes to log files when log level is debug/trace and a file directory is configured.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { ConfigService, type LogLevel } from "./config";

export type { LogLevel } from "./config";

export const LOG_LEVELS: Record<LogLevel, number> = {
	off: 0,
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
	trace: 5,
};

type LoggerConfigSource = Pick<
	ConfigService,
	"logLevel" | "logOutputChannel" | "logFileDirectory" | "onDidChange"
>;

function createFallbackConfigService(): LoggerConfigSource {
	return {
		logLevel: "info",
		logOutputChannel: false,
		logFileDirectory: "",
		onDidChange: () => ({ dispose: () => undefined }),
	};
}

function createConfigServiceSafely(): LoggerConfigSource {
	try {
		return new ConfigService();
	} catch {
		return createFallbackConfigService();
	}
}

function canCreateOutputChannel(): boolean {
	try {
		return typeof vscode.window?.createOutputChannel === "function";
	} catch {
		return false;
	}
}

/**
 * Shared output channel instance.
 * Set by initializeOutputChannel() which should be called once from activate().
 */
let _sharedOutputChannel: vscode.OutputChannel | null = null;

/**
 * Initialize the shared output channel.
 * Call this ONCE from extension activate() and add the returned disposable to context.subscriptions.
 */
export function initializeOutputChannel(): vscode.Disposable {
	if (_sharedOutputChannel) {
		return { dispose: () => {} };
	}

	try {
		_sharedOutputChannel = vscode.window.createOutputChannel("Vercel AI Gateway");
	} catch {
		return { dispose: () => {} };
	}

	return {
		dispose: () => {
			_sharedOutputChannel?.dispose();
			_sharedOutputChannel = null;
		},
	};
}

function getSharedOutputChannel(): vscode.OutputChannel | null {
	return _sharedOutputChannel;
}

/**
 * Reset the shared output channel singleton (for testing only).
 * @internal
 */
export function _resetOutputChannelForTesting(): void {
	_sharedOutputChannel?.dispose();
	_sharedOutputChannel = null;
}

export class Logger {
	private outputChannel: vscode.OutputChannel | null = null;
	private level: LogLevel = "info";
	private configService: LoggerConfigSource;
	private readonly disposable: { dispose: () => void };
	private logFileDirectory: string = "";
	private fileLoggingInitialized = false;

	constructor(configService?: LoggerConfigSource) {
		this.configService = configService ?? createConfigServiceSafely();
		this.loadConfig();

		this.disposable = this.configService.onDidChange(() => {
			this.loadConfig();
		});
	}

	private loadConfig(): void {
		this.level = this.configService.logLevel ?? "info";
		this.logFileDirectory = this.configService.logFileDirectory ?? "";

		const useOutputChannel = this.configService.logOutputChannel ?? true;
		const canUseOutputChannel = canCreateOutputChannel();
		if (useOutputChannel && canUseOutputChannel && !this.outputChannel) {
			this.outputChannel = getSharedOutputChannel();
		} else if (!useOutputChannel && this.outputChannel) {
			this.outputChannel = null;
		}

		if (this.shouldUseFileLogging() && !this.fileLoggingInitialized) {
			this.initializeFileLogging();
		}
	}

	private shouldUseFileLogging(): boolean {
		return this.logFileDirectory !== "" && (this.level === "debug" || this.level === "trace");
	}

	private getResolvedLogDirectory(): string | null {
		if (!this.logFileDirectory) return null;

		if (path.isAbsolute(this.logFileDirectory)) {
			return this.logFileDirectory;
		}

		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			return path.join(workspaceFolders[0].uri.fsPath, this.logFileDirectory);
		}

		return null;
	}

	private initializeFileLogging(): void {
		const logDir = this.getResolvedLogDirectory();
		if (!logDir) return;

		try {
			if (!fs.existsSync(logDir)) {
				fs.mkdirSync(logDir, { recursive: true });
			}

			const currentLogPath = path.join(logDir, "current.log");
			const previousLogPath = path.join(logDir, "previous.log");

			if (fs.existsSync(currentLogPath)) {
				fs.renameSync(currentLogPath, previousLogPath);
			}

			const sessionStart = `\n${"=".repeat(80)}\nSession started: ${new Date().toISOString()}\n${"=".repeat(80)}\n\n`;
			fs.writeFileSync(currentLogPath, sessionStart);

			this.fileLoggingInitialized = true;
		} catch {
			this.fileLoggingInitialized = false;
		}
	}

	private writeToFile(level: LogLevel, formatted: string): void {
		if (!this.shouldUseFileLogging()) return;

		const logDir = this.getResolvedLogDirectory();
		if (!logDir) return;

		try {
			const currentLogPath = path.join(logDir, "current.log");
			fs.appendFileSync(currentLogPath, `${formatted}\n`);

			if (level === "error") {
				const errorsLogPath = path.join(logDir, "errors.log");
				fs.appendFileSync(errorsLogPath, `${formatted}\n`);
			}
		} catch {
			// Silently fail
		}
	}

	private shouldLog(level: LogLevel): boolean {
		return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
	}

	private log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (!this.shouldLog(level)) return;

		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
		const formatted = `${prefix} ${message}`;

		switch (level) {
			case "error":
				console.error(formatted, ...args);
				break;
			case "warn":
				console.warn(formatted, ...args);
				break;
			case "info":
				console.info(formatted, ...args);
				break;
			case "debug":
			case "trace":
				console.debug(formatted, ...args);
				break;
		}

		const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : "";
		const fullFormatted = formatted + argsStr;

		if (this.outputChannel) {
			this.outputChannel.appendLine(fullFormatted);
		}

		this.writeToFile(level, fullFormatted);
	}

	error(message: string, ...args: unknown[]): void {
		this.log("error", message, ...args);
	}

	warn(message: string, ...args: unknown[]): void {
		this.log("warn", message, ...args);
	}

	info(message: string, ...args: unknown[]): void {
		this.log("info", message, ...args);
	}

	debug(message: string, ...args: unknown[]): void {
		this.log("debug", message, ...args);
	}

	trace(message: string, ...args: unknown[]): void {
		this.log("trace", message, ...args);
	}

	show(): void {
		this.outputChannel?.show();
	}

	dispose(): void {
		this.disposable.dispose();
		this.outputChannel = null;
	}
}

// Lazy singleton logger instance
let _logger: Logger | null = null;

function getLogger(): Logger {
	if (!_logger) {
		_logger = new Logger();
	}
	return _logger;
}

// Main logger export - simple proxy to singleton
export const logger = {
	error(message: string, ...args: unknown[]): void {
		getLogger().error(message, ...args);
	},
	warn(message: string, ...args: unknown[]): void {
		getLogger().warn(message, ...args);
	},
	info(message: string, ...args: unknown[]): void {
		getLogger().info(message, ...args);
	},
	debug(message: string, ...args: unknown[]): void {
		getLogger().debug(message, ...args);
	},
	trace(message: string, ...args: unknown[]): void {
		getLogger().trace(message, ...args);
	},
	show(): void {
		getLogger().show();
	},
	dispose(): void {
		getLogger().dispose();
		_logger = null;
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
			logger.error(`${context} - Details:`, details);
		}

		if (error instanceof Error && error.stack) {
			logger.debug(`${context} - Stack:`, error.stack);
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
