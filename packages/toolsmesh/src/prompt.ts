import type { ToolRegistry, VirtualFilesystem } from "./types";

/**
 * Options for system prompt generation.
 */
export type SystemPromptOptions = {
	/** Include a quick reference of available tools */
	includeSummary?: boolean;
	/** Custom prefix to prepend */
	prefix?: string;
	/** Custom suffix to append */
	suffix?: string;
};

/**
 * Generate the full system prompt for the toolsmesh.
 */
export function generateSystemPrompt(
	tools: ToolRegistry,
	fs: VirtualFilesystem,
	options?: SystemPromptOptions,
): string {
	const parts: string[] = [];

	if (options?.prefix) {
		parts.push(options.prefix);
	}

	parts.push(`# Tool Discovery System

You have access to a virtual filesystem containing tool definitions at \`${fs.root}\`.
Use the \`mesh_bash\` tool to explore and discover available tools, and \`mesh_exec\` to execute TypeScript code that calls them.

## Workflow

1. **Discover** - Use bash commands to explore available tools:
   \`\`\`
   ls ${fs.root}              # List all tools
   cat ${fs.root}/index.ts    # Read tool summary
   grep -r "keyword" ${fs.root}  # Search by functionality
   \`\`\`

2. **Understand** - Read tool definitions to see their interfaces:
   \`\`\`
   cat ${fs.root}/toolName.ts  # See parameters and types
   \`\`\`

3. **Execute** - Write TypeScript code to call tools:
   \`\`\`typescript
   const result = await toolName({ param: "value" });
   \`\`\`

## Available Mesh Tools

- **mesh_bash** - Execute bash commands against the virtual filesystem
- **mesh_exec** - Execute TypeScript code that calls registered tools

## Tools (${Object.keys(tools).length} available)

${Object.entries(tools)
	.map(([name, tool]) => `- ${name} - ${tool.description}`)
	.join("\n")}`);

	if (options?.includeSummary) {
		parts.push("## Quick Reference\n");
		for (const [name, tool] of Object.entries(tools)) {
			parts.push(`- **${name}** - ${tool.description}`);
		}
	}

	if (options?.suffix) {
		parts.push(options.suffix);
	}

	return parts.join("\n\n");
}

/**
 * Generate a compact prompt suitable for context-constrained scenarios.
 */
export function generateCompactPrompt(tools: ToolRegistry, fs: VirtualFilesystem): string {
	const toolNames = Object.keys(tools);
	return `Toolsmesh: ${toolNames.length} tools at ${fs.root}. Use mesh_bash (ls/cat/grep) to explore, mesh_exec to execute TypeScript code calling tools.`;
}
