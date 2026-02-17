import type { VirtualFilesystem } from "./types";

/**
 * Strategy for compacting tool results.
 */
export type CompactionStrategy = "write-to-filesystem" | "drop-results";

/**
 * Boundary configuration for compaction.
 */
export type CompactionBoundary =
	| "all"
	| { type: "keep-first"; count: number }
	| { type: "keep-last"; count: number }
	| { type: "after-index"; index: number };

/**
 * Options for the compact function.
 */
export type CompactOptions = {
	/** How to handle large results */
	strategy?: CompactionStrategy;
	/** Which messages to compact */
	boundary?: CompactionBoundary;
	/** Session ID for file organization */
	sessionId?: string;
	/** Minimum size in chars to trigger compaction */
	minSize?: number;
	/** Tools to never compact */
	excludeTools?: string[];
};

/**
 * A tool result entry within a message.
 */
export type ToolResultMessage = {
	role: "tool";
	content: Array<{
		type: "tool-result";
		toolCallId: string;
		toolName: string;
		result: unknown;
	}>;
};

/**
 * Any message type that can appear in a conversation.
 */
export type CompactableMessage =
	| { role: "system"; content: string }
	| { role: "user"; content: string }
	| { role: "assistant"; content: string }
	| ToolResultMessage;

/**
 * Result of a compaction operation.
 */
export type CompactionResult = {
	/** The compacted messages */
	messages: CompactableMessage[];
	/** Number of results compacted */
	compactedCount: number;
	/** Bytes saved */
	bytesSaved: number;
	/** Paths where results were stored (write-to-filesystem only) */
	storedPaths: string[];
};

/**
 * Compact large tool results in a message array.
 */
export function compact(
	messages: CompactableMessage[],
	fs: VirtualFilesystem,
	options?: CompactOptions,
): CompactionResult {
	const strategy = options?.strategy ?? "write-to-filesystem";
	const boundary = options?.boundary ?? "all";
	const sessionId = options?.sessionId ?? "default";
	const minSize = options?.minSize ?? 500;
	const excludeTools = options?.excludeTools ?? ["mesh_bash", "mesh_exec"];

	const compactableRange = getCompactableRange(messages.length, boundary);
	const compacted = [...messages] as CompactableMessage[];
	let compactedCount = 0;
	let bytesSaved = 0;
	const storedPaths: string[] = [];

	for (let i = 0; i < compacted.length; i++) {
		if (!compactableRange.includes(i)) continue;

		const msg = compacted[i];
		if (msg.role !== "tool") continue;

		const toolMsg = msg as ToolResultMessage;
		const newContent = toolMsg.content.map((entry) => {
			if (entry.type !== "tool-result") return entry;
			if (excludeTools.includes(entry.toolName)) return entry;

			const resultStr =
				typeof entry.result === "string" ? entry.result : JSON.stringify(entry.result);
			if (resultStr.length < minSize) return entry;

			bytesSaved += resultStr.length;
			compactedCount++;

			if (strategy === "write-to-filesystem") {
				const filePath = `${fs.root}/compact/${sessionId}/results/${entry.toolName}_${entry.toolCallId}_${Date.now()}.json`;

				// Ensure compact directory exists
				ensureDirectory(fs, `${fs.root}/compact`);
				ensureDirectory(fs, `${fs.root}/compact/${sessionId}`);
				ensureDirectory(fs, `${fs.root}/compact/${sessionId}/results`);

				fs.files.set(filePath, {
					path: filePath,
					content: resultStr,
					isDirectory: false,
				});
				storedPaths.push(filePath);

				return {
					...entry,
					result: `[Result stored in filesystem at ${filePath}. Use mesh_bash to retrieve: cat ${filePath}]`,
				};
			}

			// drop-results strategy
			return {
				...entry,
				result: `[Result from ${entry.toolName} (${resultStr.length} chars) dropped to preserve context window. Call the tool again if needed.]`,
			};
		});

		compacted[i] = { ...toolMsg, content: newContent };
	}

	return { messages: compacted, compactedCount, bytesSaved, storedPaths };
}

/**
 * Create a reusable compactor function.
 */
export function createCompactor(
	fs: VirtualFilesystem,
	options?: CompactOptions,
): (messages: CompactableMessage[]) => CompactionResult {
	return (messages) => compact(messages, fs, options);
}

/**
 * Analyze potential compaction savings without modifying messages.
 */
export function analyzeCompaction(
	messages: CompactableMessage[],
	options?: { minSize?: number; excludeTools?: string[] },
): {
	totalToolResults: number;
	compactableResults: number;
	estimatedSavings: number;
	largestResult: { toolName: string; size: number } | null;
} {
	const minSize = options?.minSize ?? 500;
	const excludeTools = options?.excludeTools ?? ["mesh_bash", "mesh_exec"];

	let totalToolResults = 0;
	let compactableResults = 0;
	let estimatedSavings = 0;
	let largestResult: { toolName: string; size: number } | null = null;

	for (const msg of messages) {
		if (msg.role !== "tool") continue;
		const toolMsg = msg as ToolResultMessage;

		for (const entry of toolMsg.content) {
			if (entry.type !== "tool-result") continue;
			totalToolResults++;

			if (excludeTools.includes(entry.toolName)) continue;

			const resultStr =
				typeof entry.result === "string" ? entry.result : JSON.stringify(entry.result);

			if (!largestResult || resultStr.length > largestResult.size) {
				largestResult = { toolName: entry.toolName, size: resultStr.length };
			}

			if (resultStr.length >= minSize) {
				compactableResults++;
				estimatedSavings += resultStr.length;
			}
		}
	}

	return { totalToolResults, compactableResults, estimatedSavings, largestResult };
}

/**
 * Clean up compacted results for a specific session.
 */
export function cleanupSession(
	fs: VirtualFilesystem,
	sessionId?: string,
): { deletedCount: number; deletedPaths: string[] } {
	const id = sessionId ?? "default";
	const prefix = `${fs.root}/compact/${id}/`;
	const deletedPaths: string[] = [];

	for (const [path] of fs.files) {
		if (path.startsWith(prefix)) {
			deletedPaths.push(path);
		}
	}

	for (const path of deletedPaths) {
		fs.files.delete(path);
	}

	// Clean up empty session directory
	if (deletedPaths.length > 0) {
		fs.files.delete(`${fs.root}/compact/${id}/results`);
		fs.files.delete(`${fs.root}/compact/${id}`);
	}

	return { deletedCount: deletedPaths.length, deletedPaths };
}

/**
 * Clean up all compacted results across all sessions.
 */
export function cleanupAllSessions(fs: VirtualFilesystem): {
	deletedCount: number;
	deletedPaths: string[];
} {
	const prefix = `${fs.root}/compact/`;
	const deletedPaths: string[] = [];

	for (const [path] of fs.files) {
		if (path.startsWith(prefix)) {
			deletedPaths.push(path);
		}
	}

	for (const path of deletedPaths) {
		fs.files.delete(path);
	}

	// Clean up compact directory
	fs.files.delete(`${fs.root}/compact`);

	return { deletedCount: deletedPaths.length, deletedPaths };
}

/**
 * List all active sessions with compacted results.
 */
export function listSessions(fs: VirtualFilesystem): string[] {
	const prefix = `${fs.root}/compact/`;
	const sessions = new Set<string>();

	for (const [path] of fs.files) {
		if (path.startsWith(prefix)) {
			const relative = path.slice(prefix.length);
			const sessionId = relative.split("/")[0];
			if (sessionId) {
				sessions.add(sessionId);
			}
		}
	}

	return [...sessions].sort();
}

/**
 * Get the range of indices that are compactable based on boundary config.
 */
function getCompactableRange(length: number, boundary: CompactionBoundary): number[] {
	if (boundary === "all") {
		return Array.from({ length }, (_, i) => i);
	}

	if (boundary.type === "keep-first") {
		return Array.from(
			{ length: Math.max(0, length - boundary.count) },
			(_, i) => i + boundary.count,
		);
	}

	if (boundary.type === "keep-last") {
		return Array.from({ length: Math.max(0, length - boundary.count) }, (_, i) => i);
	}

	if (boundary.type === "after-index") {
		return Array.from(
			{ length: Math.max(0, length - boundary.index - 1) },
			(_, i) => i + boundary.index + 1,
		);
	}

	return [];
}

/**
 * Ensure a directory exists in the filesystem.
 */
function ensureDirectory(fs: VirtualFilesystem, path: string): void {
	if (!fs.files.has(path)) {
		fs.files.set(path, { path, content: "", isDirectory: true });
	}
}
