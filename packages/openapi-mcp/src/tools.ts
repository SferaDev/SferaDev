import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UpstreamAuth } from "./auth";
import { buildAuthHeaders, buildAuthQueryParams } from "./auth";
import { buildAnnotations, buildDescription, buildZodShape } from "./schema";
import type { ParsedOperation } from "./spec";

export interface RegisterToolsOptions {
	server: McpServer;
	operations: ParsedOperation[];
	baseUrl: string;
	auth: UpstreamAuth;
	/** Filter by tags — only register operations that have at least one of these tags */
	tags?: string[];
	/** Explicitly include only these operationIds */
	includeOperations?: string[];
	/** Explicitly exclude these operationIds */
	excludeOperations?: string[];
}

export interface RegisteredOperationTool {
	operationId: string;
	operation: ParsedOperation;
	enable: () => void;
	disable: () => void;
}

/**
 * Register MCP tools for each OpenAPI operation.
 * Returns handles that allow dynamic enable/disable of individual tools.
 */
export function registerTools(options: RegisterToolsOptions): RegisteredOperationTool[] {
	const { server, operations, baseUrl, auth, tags, includeOperations, excludeOperations } = options;

	const registered: RegisteredOperationTool[] = [];

	const filtered = operations.filter((op) => {
		if (includeOperations && !includeOperations.includes(op.operationId)) return false;
		if (excludeOperations?.includes(op.operationId)) return false;
		if (tags && tags.length > 0) {
			if (!op.tags?.some((t) => tags.includes(t))) return false;
		}
		return true;
	});

	for (const operation of filtered) {
		const zodShape = buildZodShape(operation);
		const description = buildDescription(operation);
		const _annotations = buildAnnotations(operation);

		const registeredTool = server.registerTool(
			operation.operationId,
			{
				title: operation.summary ?? operation.operationId,
				description,
				inputSchema: zodShape,
				annotations: {
					readOnlyHint: operation.method === "get",
					destructiveHint: operation.method === "delete",
					idempotentHint: operation.method === "get" || operation.method === "put",
					openWorldHint: true,
				},
			},
			async (args, extra) => {
				return executeOperation({
					operation,
					args: args as Record<string, unknown>,
					baseUrl,
					auth,
					incomingAuthorization: extractIncomingAuthorization(extra),
				});
			},
		);

		registered.push({
			operationId: operation.operationId,
			operation,
			enable: () => registeredTool.enable(),
			disable: () => registeredTool.disable(),
		});
	}

	return registered;
}

interface ExecuteOperationOptions {
	operation: ParsedOperation;
	args: Record<string, unknown>;
	baseUrl: string;
	auth: UpstreamAuth;
	incomingAuthorization?: string;
}

async function executeOperation(options: ExecuteOperationOptions) {
	const { operation, args, baseUrl, auth, incomingAuthorization } = options;

	// Build path with path parameters substituted
	let path = operation.path;
	for (const param of operation.parameters.filter((p) => p.in === "path")) {
		const value = args[param.name];
		if (value !== undefined) {
			path = path.replace(`{${param.name}}`, encodeURIComponent(String(value)));
		}
	}

	// Build query string from query parameters
	const queryParams = new URLSearchParams();
	for (const param of operation.parameters.filter((p) => p.in === "query")) {
		const value = args[param.name];
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				for (const v of value) queryParams.append(param.name, String(v));
			} else {
				queryParams.set(param.name, String(value));
			}
		}
	}

	// Add auth query params
	for (const [key, value] of Object.entries(buildAuthQueryParams(auth))) {
		queryParams.set(key, value);
	}

	const queryString = queryParams.toString();
	const url = `${baseUrl.replace(/\/$/, "")}${path}${queryString ? `?${queryString}` : ""}`;

	// Build headers
	const headers: Record<string, string> = {
		Accept: "application/json",
		...buildAuthHeaders(auth, incomingAuthorization),
	};

	// Build request body
	let body: string | undefined;
	if (operation.requestBody) {
		const bodyFields: Record<string, unknown> = {};
		const bodySchema = operation.requestBody.schema;
		if (bodySchema.type === "object" && bodySchema.properties) {
			const props = bodySchema.properties as Record<string, unknown>;
			for (const name of Object.keys(props)) {
				if (args[name] !== undefined) {
					bodyFields[name] = args[name];
				}
			}
		} else if (args.body !== undefined) {
			// Non-object body was wrapped under "body"
			body = JSON.stringify(args.body);
		}

		if (!body && Object.keys(bodyFields).length > 0) {
			body = JSON.stringify(bodyFields);
		}

		if (body) {
			headers["Content-Type"] = operation.requestBody.contentType.startsWith("application/json")
				? "application/json"
				: operation.requestBody.contentType;
		}
	}

	let response: Response;
	try {
		response = await fetch(url, {
			method: operation.method.toUpperCase(),
			headers,
			body,
			signal: AbortSignal.timeout(30_000),
		});
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: "text" as const,
					text: `Network error: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
		};
	}

	const responseText = await response.text();
	let responseData: unknown;
	try {
		responseData = JSON.parse(responseText);
	} catch {
		responseData = responseText;
	}

	if (!response.ok) {
		return {
			isError: true,
			content: [
				{
					type: "text" as const,
					text: `HTTP ${response.status} ${response.statusText}: ${typeof responseData === "string" ? responseData : JSON.stringify(responseData, null, 2)}`,
				},
			],
		};
	}

	const text =
		typeof responseData === "string" ? responseData : JSON.stringify(responseData, null, 2);

	return {
		content: [{ type: "text" as const, text }],
	};
}

function extractIncomingAuthorization(extra: unknown): string | undefined {
	if (typeof extra !== "object" || extra === null) return undefined;
	const authInfo = (extra as { authInfo?: { token?: string } }).authInfo;
	if (!authInfo?.token) return undefined;
	return `Bearer ${authInfo.token}`;
}
