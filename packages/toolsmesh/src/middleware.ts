import type { LanguageModelV3CallOptions, LanguageModelV3Middleware } from "@ai-sdk/provider-utils";
import { z } from "zod";
import { createVirtualFilesystem } from "./filesystem";
import { generateCompactPrompt, generateSystemPrompt } from "./prompt";
import { createMeshTools } from "./sandbox-tools";
import type { MeshTool, ToolRegistry, ToolsmeshOptions, VirtualFilesystem } from "./types";

/**
 * AI SDK tool format used by the middleware.
 */
type LanguageModelV3FunctionTool = {
	type: "function";
	name: string;
	description?: string;
	inputSchema: Record<string, unknown>;
};

/**
 * Create a toolsmesh without middleware integration.
 */
export function createToolsmesh(options: ToolsmeshOptions): {
	filesystem: VirtualFilesystem;
	tools: Record<string, MeshTool>;
	systemPrompt: string;
	compactPrompt: string;
} {
	const fs = createVirtualFilesystem(options.tools, {
		namespace: options.namespace,
		includeSchemas: options.includeSchemas,
	});

	const meshTools = createMeshTools(options.tools, fs, {
		sandbox: options.sandbox,
	});

	const toolMap: Record<string, MeshTool> = {};
	for (const tool of meshTools) {
		toolMap[tool.name] = tool;
	}

	const systemPrompt = generateSystemPrompt(options.tools, fs, {
		prefix: options.systemPromptPrefix,
		suffix: options.systemPromptSuffix,
		includeSummary: true,
	});

	const compactPrompt = generateCompactPrompt(options.tools, fs);

	return { filesystem: fs, tools: toolMap, systemPrompt, compactPrompt };
}

/**
 * Extract tools from AI SDK CoreTool format to ToolRegistry.
 */
export function extractTools(
	aiSdkTools: Record<
		string,
		{
			description?: string;
			parameters: z.ZodType;
			execute?: (params: unknown) => Promise<unknown>;
		}
	>,
): ToolRegistry {
	const registry: ToolRegistry = {};

	for (const [name, tool] of Object.entries(aiSdkTools)) {
		registry[name] = {
			description: tool.description ?? `Tool: ${name}`,
			parameters: tool.parameters,
			execute: tool.execute,
		};
	}

	return registry;
}

/**
 * Convert a MeshTool to AI SDK tool format.
 */
function meshToolToAITool(meshTool: MeshTool): LanguageModelV3FunctionTool {
	const jsonSchema = z.toJSONSchema(meshTool.parameters, {
		target: "draft-07",
	}) as Record<string, unknown>;
	delete jsonSchema.$schema;

	return {
		type: "function",
		name: meshTool.name,
		description: meshTool.description,
		inputSchema: jsonSchema,
	};
}

/**
 * Create an AI SDK v3 middleware that wraps tools into a virtual filesystem.
 */
export function createToolsmeshMiddleware(options: ToolsmeshOptions): LanguageModelV3Middleware {
	const mesh = createToolsmesh(options);
	const meshToolsArray = Object.values(mesh.tools);

	return {
		transformParams: async ({ params }) => {
			const typedParams = params as LanguageModelV3CallOptions;

			// Replace tools with mesh tools
			const tools = meshToolsArray.map(meshToolToAITool);

			// Inject system prompt
			const prompt = typedParams.prompt ?? [];
			const hasSystemPrompt = prompt.some((m) => m.role === "system");

			const newPrompt = hasSystemPrompt
				? prompt.map((m) =>
						m.role === "system"
							? {
									...m,
									content: `${mesh.systemPrompt}\n\n${typeof m.content === "string" ? m.content : ""}`,
								}
							: m,
					)
				: [{ role: "system" as const, content: mesh.systemPrompt }, ...prompt];

			return {
				...typedParams,
				prompt: newPrompt,
				tools,
			} as typeof params;
		},
		wrapGenerate: async ({ doGenerate }) => {
			const result = await doGenerate();

			// Execute mesh tool calls
			if (result.toolCalls) {
				for (const toolCall of result.toolCalls) {
					const meshTool = mesh.tools[toolCall.toolName];
					if (meshTool) {
						const parsedArgs =
							typeof toolCall.args === "string" ? JSON.parse(toolCall.args) : toolCall.args;
						await meshTool.execute(parsedArgs);
					}
				}
			}

			return result;
		},
	};
}
