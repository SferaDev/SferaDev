import { z } from "zod";
import type {
	GeneratedToolInterface,
	ToolDefinition,
	ToolRegistry,
	VirtualFile,
	VirtualFilesystem,
} from "./types";

/**
 * Options for creating a virtual filesystem.
 */
type FilesystemOptions = {
	/** Root directory name (default: "tools") */
	namespace?: string;
	/** Include JSON schemas in tool files (default: true) */
	includeSchemas?: boolean;
};

/**
 * Create a virtual filesystem from a tool registry.
 * Each tool becomes a TypeScript file with interface definitions.
 */
export function createVirtualFilesystem(
	tools: ToolRegistry,
	options?: FilesystemOptions,
): VirtualFilesystem {
	const namespace = options?.namespace ?? "tools";
	const includeSchemas = options?.includeSchemas ?? true;
	const root = `/${namespace}`;
	const files = new Map<string, VirtualFile>();

	// Create root directory
	files.set(root, { path: root, content: "", isDirectory: true });

	// Create tool files
	const toolNames = Object.keys(tools);
	for (const [name, tool] of Object.entries(tools)) {
		const generated = generateToolInterface(name, tool);
		let content = generated.interfaceCode;

		if (includeSchemas) {
			const jsonSchema = z.toJSONSchema(tool.parameters, { target: "draft-07" }) as Record<
				string,
				unknown
			>;
			content += `\n\n/*\n * JSON Schema:\n * ${JSON.stringify(jsonSchema, null, 2).replace(/\n/g, "\n * ")}\n */`;
		}

		const filePath = `${root}/${name}.ts`;
		files.set(filePath, { path: filePath, content, isDirectory: false });
	}

	// Create index file
	const indexContent = generateIndexFile(toolNames, tools);
	files.set(`${root}/index.ts`, {
		path: `${root}/index.ts`,
		content: indexContent,
		isDirectory: false,
	});

	// Create README
	const readmeContent = generateReadme(toolNames, tools, root);
	files.set(`${root}/README.md`, {
		path: `${root}/README.md`,
		content: readmeContent,
		isDirectory: false,
	});

	return { files, root };
}

/**
 * Generate a TypeScript interface for a tool.
 */
function generateToolInterface(name: string, tool: ToolDefinition): GeneratedToolInterface {
	const interfaceName = `${name.charAt(0).toUpperCase()}${name.slice(1)}Params`;
	const properties = extractProperties(tool.parameters);

	const propertyLines = properties.map((p) => {
		const comment = p.description ? ` // ${p.description}` : "";
		const optional = p.optional ? "?" : "";
		return `  ${p.name}${optional}: ${p.type};${comment}`;
	});

	const interfaceCode = `// Tool: ${name}
// Description: ${tool.description}

export interface ${interfaceName} {
${propertyLines.join("\n")}
}

// Function signature:
declare function ${name}(params: ${interfaceName}): Promise<unknown>;

// Usage example:
// const result = await ${name}({
//   // ... parameters
// });`;

	return {
		name,
		interfaceCode,
		functionSignature: `${name}(params: ${interfaceName}): Promise<unknown>`,
		importStatement: `import type { ${interfaceName} } from "./${name}";`,
	};
}

/**
 * Extract property information from a Zod schema.
 */
function extractProperties(
	schema: ToolDefinition["parameters"],
): Array<{ name: string; type: string; optional: boolean; description?: string }> {
	const jsonSchema = z.toJSONSchema(schema, { target: "draft-07" }) as Record<string, unknown>;
	const properties = (jsonSchema.properties ?? {}) as Record<
		string,
		{ type?: string; enum?: unknown[]; description?: string }
	>;
	const required = (jsonSchema.required ?? []) as string[];

	return Object.entries(properties).map(([name, prop]) => ({
		name,
		type: jsonSchemaTypeToTs(prop),
		optional: !required.includes(name),
		description: prop.description,
	}));
}

/**
 * Convert a JSON Schema type to a TypeScript type string.
 */
function jsonSchemaTypeToTs(prop: {
	type?: string;
	enum?: unknown[];
	anyOf?: unknown[];
	items?: unknown;
}): string {
	if (prop.enum) {
		return prop.enum.map((v) => JSON.stringify(v)).join(" | ");
	}
	if (prop.anyOf) {
		// Handle optional fields (type | undefined patterns)
		const types = (prop.anyOf as Array<{ type?: string; enum?: unknown[] }>)
			.map((s) => jsonSchemaTypeToTs(s))
			.filter((t) => t !== "undefined");
		return types.join(" | ");
	}
	switch (prop.type) {
		case "string":
			return "string";
		case "number":
		case "integer":
			return "number";
		case "boolean":
			return "boolean";
		case "array":
			return "unknown[]";
		case "object":
			return "Record<string, unknown>";
		default:
			return "unknown";
	}
}

/**
 * Generate index.ts listing all tools.
 */
function generateIndexFile(toolNames: string[], tools: ToolRegistry): string {
	const lines = [
		"// Auto-generated index of available tools",
		`// Total tools: ${toolNames.length}`,
		"",
	];

	for (const name of toolNames) {
		const tool = tools[name];
		lines.push(`// ${name} - ${tool.description}`);
	}

	lines.push("");
	lines.push("// Import individual tools:");
	for (const name of toolNames) {
		lines.push(
			`// import type { ${name.charAt(0).toUpperCase()}${name.slice(1)}Params } from "./${name}";`,
		);
	}

	return lines.join("\n");
}

/**
 * Generate README.md with usage instructions.
 */
function generateReadme(toolNames: string[], tools: ToolRegistry, root: string): string {
	const lines = [
		"# Tool Filesystem",
		"",
		`This filesystem contains ${toolNames.length} tool definitions.`,
		"",
		"## Available Tools",
		"",
	];

	for (const name of toolNames) {
		const tool = tools[name];
		lines.push(`- **${name}** - ${tool.description}`);
	}

	lines.push("");
	lines.push("## Usage");
	lines.push("");
	lines.push("Browse tools using bash commands:");
	lines.push("```bash");
	lines.push(`ls ${root}              # List all tools`);
	lines.push(`cat ${root}/index.ts    # See tool summary`);
	lines.push(`grep -r "keyword" ${root}  # Search tools`);
	lines.push("```");
	lines.push("");
	lines.push("Execute tools using TypeScript:");
	lines.push("```typescript");
	if (toolNames.length > 0) {
		lines.push(`const result = await ${toolNames[0]}({ /* params */ });`);
	}
	lines.push("```");

	return lines.join("\n");
}

/**
 * List directory contents.
 */
export function listDirectory(fs: VirtualFilesystem, dirPath: string): VirtualFile[] {
	const results: VirtualFile[] = [];
	const normalizedDir = dirPath.endsWith("/") ? dirPath.slice(0, -1) : dirPath;

	for (const [path, file] of fs.files) {
		if (path === normalizedDir) continue;
		// Check if this file is a direct child of the directory
		if (path.startsWith(`${normalizedDir}/`)) {
			const relative = path.slice(normalizedDir.length + 1);
			if (!relative.includes("/")) {
				results.push(file);
			}
		}
	}

	return results;
}

/**
 * Read a file from the filesystem.
 */
export function readFile(fs: VirtualFilesystem, filePath: string): VirtualFile | null {
	const file = fs.files.get(filePath);
	if (!file || file.isDirectory) return null;
	return file;
}

/**
 * Find files matching a glob-like pattern.
 */
export function findFiles(fs: VirtualFilesystem, pattern: string): VirtualFile[] {
	const regex = new RegExp(pattern.replace(/\*/g, ".*"), "i");
	const results: VirtualFile[] = [];

	for (const [path, file] of fs.files) {
		if (file.isDirectory) continue;
		const fileName = path.split("/").pop() ?? "";
		if (regex.test(fileName)) {
			results.push(file);
		}
	}

	return results;
}

/**
 * Search file contents for a pattern.
 */
export function grepFiles(
	fs: VirtualFilesystem,
	query: string,
): Array<{ file: VirtualFile; matches: string[] }> {
	const results: Array<{ file: VirtualFile; matches: string[] }> = [];

	for (const [, file] of fs.files) {
		if (file.isDirectory) continue;
		const lines = file.content.split("\n");
		const matches = lines.filter((line) => line.toLowerCase().includes(query.toLowerCase()));
		if (matches.length > 0) {
			results.push({ file, matches });
		}
	}

	return results;
}
