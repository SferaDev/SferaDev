/**
 * Model filtering utilities for the Vercel AI Gateway extension.
 *
 * Provides allowlist/denylist filtering with wildcard pattern support.
 */

import * as vscode from "vscode";

export interface ModelFilterConfig {
	allowlist: string[];
	denylist: string[];
	fallbacks: Record<string, string[]>;
	default: string;
}

export interface ModelInfo {
	id: string;
	name?: string;
}

/**
 * Check if a model ID matches a pattern.
 * Supports wildcard (*) matching.
 */
export function matchesPattern(modelId: string, pattern: string): boolean {
	if (!pattern) return false;

	if (pattern.includes("*")) {
		// Convert wildcard pattern to regex
		// Escape special regex chars except *, then replace * with .*
		const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		const regexPattern = escaped.replace(/\*/g, ".*");
		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(modelId);
	}

	return modelId === pattern;
}

export class ModelFilter {
	private config: ModelFilterConfig;

	constructor() {
		this.config = this.loadConfig();

		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("vercelAiGateway.models")) {
				this.config = this.loadConfig();
			}
		});
	}

	private loadConfig(): ModelFilterConfig {
		const config = vscode.workspace.getConfiguration("vercelAiGateway.models");
		return {
			allowlist: config.get("allowlist", []),
			denylist: config.get("denylist", []),
			fallbacks: config.get("fallbacks", {}),
			default: config.get("default", ""),
		};
	}

	/**
	 * Filter models based on allowlist and denylist configuration.
	 * Allowlist is applied first, then denylist.
	 */
	filterModels<T extends ModelInfo>(models: T[]): T[] {
		let filtered = models;

		// Apply allowlist if configured
		if (this.config.allowlist.length > 0) {
			filtered = filtered.filter((m) =>
				this.config.allowlist.some((pattern) => matchesPattern(m.id, pattern)),
			);
		}

		// Apply denylist if configured
		if (this.config.denylist.length > 0) {
			filtered = filtered.filter(
				(m) => !this.config.denylist.some((pattern) => matchesPattern(m.id, pattern)),
			);
		}

		return filtered;
	}

	/**
	 * Get fallback models for a given model ID.
	 */
	getFallbacks(modelId: string): string[] {
		return this.config.fallbacks[modelId] || [];
	}

	/**
	 * Get the default model ID.
	 */
	getDefaultModel(): string {
		return this.config.default;
	}
}
