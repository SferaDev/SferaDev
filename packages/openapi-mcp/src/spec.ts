import { readFileSync } from "node:fs";
import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts/oas31";
import { parse as parseYaml } from "yaml";

const HTTP_METHODS = ["get", "put", "post", "patch", "delete"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export interface ParsedOperation {
	operationId: string;
	method: HttpMethod;
	path: string;
	summary?: string;
	description?: string;
	tags?: string[];
	parameters: ParsedParameter[];
	requestBody?: ParsedRequestBody;
	responses: Record<string, ParsedResponse>;
	deprecated?: boolean;
}

export interface ParsedParameter {
	name: string;
	in: "path" | "query" | "header" | "cookie";
	required: boolean;
	description?: string;
	schema: Record<string, unknown>;
}

export interface ParsedRequestBody {
	description?: string;
	required: boolean;
	schema: Record<string, unknown>;
	contentType: string;
}

export interface ParsedResponse {
	description?: string;
	schema?: Record<string, unknown>;
}

async function loadRaw(input: string): Promise<string> {
	if (input.startsWith("http://") || input.startsWith("https://")) {
		const response = await fetch(input, { signal: AbortSignal.timeout(30_000) });
		if (!response.ok) {
			throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
		}
		return response.text();
	}
	return readFileSync(input, "utf-8");
}

function parseRaw(raw: string, hint?: string): OpenAPIObject {
	const trimmed = raw.trimStart();
	if (trimmed.startsWith("{") || hint?.endsWith(".json")) {
		return JSON.parse(raw) as OpenAPIObject;
	}
	return parseYaml(raw) as OpenAPIObject;
}

export async function loadSpec(input: string): Promise<OpenAPIObject> {
	const raw = await loadRaw(input);
	return parseRaw(raw, input);
}

function resolveRef(spec: OpenAPIObject, ref: string): Record<string, unknown> | undefined {
	if (!ref.startsWith("#/")) return undefined;
	const parts = ref.slice(2).split("/");
	let node: unknown = spec;
	for (const part of parts) {
		if (typeof node !== "object" || node === null) return undefined;
		node = (node as Record<string, unknown>)[part];
	}
	return node as Record<string, unknown>;
}

function resolveSchema(
	spec: OpenAPIObject,
	schema: Record<string, unknown>,
): Record<string, unknown> {
	if ("$ref" in schema && typeof schema.$ref === "string") {
		const resolved = resolveRef(spec, schema.$ref);
		if (resolved) return resolveSchema(spec, resolved);
	}
	return schema;
}

function extractSchema(
	spec: OpenAPIObject,
	content: Record<string, unknown> | undefined,
): { schema: Record<string, unknown>; contentType: string } | undefined {
	if (!content) return undefined;
	const preferred = [
		"application/json",
		"application/x-www-form-urlencoded",
		"multipart/form-data",
	];
	for (const ct of preferred) {
		const entry = content[ct] as Record<string, unknown> | undefined;
		if (entry?.schema) {
			return {
				schema: resolveSchema(spec, entry.schema as Record<string, unknown>),
				contentType: ct,
			};
		}
	}
	const [first] = Object.entries(content);
	if (first) {
		const [ct, entry] = first;
		const e = entry as Record<string, unknown> | undefined;
		if (e?.schema) {
			return {
				schema: resolveSchema(spec, e.schema as Record<string, unknown>),
				contentType: ct,
			};
		}
	}
	return undefined;
}

function getOperationId(method: string, path: string, operation: OperationObject): string {
	if (operation.operationId) return operation.operationId;
	// Derive from method + path e.g. "GET /users/{id}" → "getUsers_id"
	const pathPart = path
		.replace(/\{([^}]+)\}/g, "_$1")
		.replace(/\//g, "_")
		.replace(/[^a-zA-Z0-9_]/g, "")
		.replace(/^_/, "");
	return `${method}${pathPart.charAt(0).toUpperCase()}${pathPart.slice(1)}`;
}

export function extractOperations(spec: OpenAPIObject): ParsedOperation[] {
	const operations: ParsedOperation[] = [];

	for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
		const item = pathItem as PathItemObject;
		const pathLevelParams = (item.parameters ?? []) as unknown as ParsedParameter[];

		for (const method of HTTP_METHODS) {
			const operation = item[method] as OperationObject | undefined;
			if (!operation) continue;

			// Merge path-level and operation-level parameters (operation wins)
			const opParams = (operation.parameters ?? []) as unknown as Array<Record<string, unknown>>;
			const mergedParams = [...pathLevelParams];
			for (const param of opParams) {
				const idx = mergedParams.findIndex(
					(p) =>
						(p as unknown as Record<string, unknown>).name === param.name &&
						(p as unknown as Record<string, unknown>).in === param.in,
				);
				if (idx >= 0) {
					mergedParams[idx] = param as unknown as ParsedParameter;
				} else {
					mergedParams.push(param as unknown as ParsedParameter);
				}
			}

			const parameters: ParsedParameter[] = mergedParams
				.filter((p) => {
					const param = p as unknown as Record<string, unknown>;
					return param.in !== "header" && param.in !== "cookie";
				})
				.map((p) => {
					const param = p as unknown as Record<string, unknown>;
					const raw = "$ref" in param ? (resolveRef(spec, param.$ref as string) ?? param) : param;
					return {
						name: raw.name as string,
						in: raw.in as "path" | "query",
						required: (raw.required as boolean | undefined) ?? raw.in === "path",
						description: raw.description as string | undefined,
						schema: raw.schema
							? resolveSchema(spec, raw.schema as Record<string, unknown>)
							: { type: "string" },
					};
				});

			let requestBody: ParsedRequestBody | undefined;
			if (operation.requestBody) {
				const rb = operation.requestBody as unknown as Record<string, unknown>;
				const resolved = "$ref" in rb ? (resolveRef(spec, rb.$ref as string) ?? rb) : rb;
				const extracted = extractSchema(spec, resolved.content as Record<string, unknown>);
				if (extracted) {
					requestBody = {
						description: resolved.description as string | undefined,
						required: (resolved.required as boolean | undefined) ?? false,
						schema: extracted.schema,
						contentType: extracted.contentType,
					};
				}
			}

			const responses: Record<string, ParsedResponse> = {};
			for (const [code, resp] of Object.entries(operation.responses ?? {})) {
				const resolved = (resp as Record<string, unknown>).$ref
					? (resolveRef(spec, (resp as Record<string, unknown>).$ref as string) ?? resp)
					: (resp as Record<string, unknown>);
				const extracted = extractSchema(spec, resolved.content as Record<string, unknown>);
				responses[code] = {
					description: resolved.description as string | undefined,
					schema: extracted?.schema,
				};
			}

			operations.push({
				operationId: getOperationId(method, path, operation),
				method,
				path,
				summary: operation.summary,
				description: operation.description,
				tags: operation.tags,
				parameters,
				requestBody,
				responses,
				deprecated: operation.deprecated,
			});
		}
	}

	return operations;
}

export function getBaseUrl(spec: OpenAPIObject): string | undefined {
	const servers = spec.servers;
	if (!servers || servers.length === 0) return undefined;
	const server = servers[0];
	if (!server?.url) return undefined;
	// Replace server variable placeholders with their defaults
	let url = server.url;
	if (server.variables) {
		for (const [name, variable] of Object.entries(server.variables)) {
			const v = variable as unknown as Record<string, unknown>;
			const defaultVal = (v.default as string | undefined) ?? "";
			url = url.replace(`{${name}}`, defaultVal);
		}
	}
	return url;
}
