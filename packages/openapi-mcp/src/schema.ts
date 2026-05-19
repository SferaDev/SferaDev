import { z } from "zod";
import type { ParsedOperation, ParsedParameter, ParsedRequestBody } from "./spec";

/**
 * Convert an OpenAPI JSON Schema object into a flat JSON Schema suitable for MCP tool input.
 * MCP input schemas must be object type with properties.
 */
export function buildInputSchema(operation: ParsedOperation): Record<string, unknown> {
	const properties: Record<string, unknown> = {};
	const required: string[] = [];

	// Add path and query parameters
	for (const param of operation.parameters) {
		properties[param.name] = {
			...cleanSchema(param.schema),
			description: param.description,
		};
		if (param.required) {
			required.push(param.name);
		}
	}

	// Merge request body properties directly into the top-level schema
	if (operation.requestBody) {
		const bodySchema = cleanSchema(operation.requestBody.schema);
		if (bodySchema.type === "object" && bodySchema.properties) {
			const bodyProps = bodySchema.properties as Record<string, unknown>;
			const bodyRequired = (bodySchema.required as string[] | undefined) ?? [];
			for (const [name, schema] of Object.entries(bodyProps)) {
				// Don't overwrite path/query params
				if (!properties[name]) {
					properties[name] = schema;
					if (bodyRequired.includes(name) || operation.requestBody.required) {
						required.push(name);
					}
				}
			}
		} else if (bodySchema.type !== "object" || Object.keys(bodySchema).length > 1) {
			// Non-object body — wrap it under "body"
			properties.body = {
				...bodySchema,
				description: operation.requestBody.description ?? "Request body",
			};
			if (operation.requestBody.required) {
				required.push("body");
			}
		}
	}

	return {
		type: "object",
		properties,
		...(required.length > 0 ? { required } : {}),
	};
}

/**
 * Build an output JSON schema from the primary 2xx response.
 */
export function buildOutputSchema(operation: ParsedOperation): Record<string, unknown> | undefined {
	for (const code of ["200", "201", "202", "204"]) {
		const resp = operation.responses[code];
		if (resp?.schema) {
			return cleanSchema(resp.schema);
		}
	}
	return undefined;
}

/**
 * Build a rich human-readable description for the tool from the OpenAPI operation.
 */
export function buildDescription(operation: ParsedOperation): string {
	const parts: string[] = [];

	if (operation.summary) parts.push(operation.summary);
	if (operation.description && operation.description !== operation.summary) {
		parts.push(operation.description);
	}
	if (operation.deprecated) {
		parts.push(
			"⚠️ DEPRECATED: This operation is deprecated and may be removed in a future version.",
		);
	}
	if (operation.tags && operation.tags.length > 0) {
		parts.push(`Tags: ${operation.tags.join(", ")}`);
	}

	const paramDocs = buildParamDocs(operation.parameters, operation.requestBody);
	if (paramDocs) parts.push(paramDocs);

	return parts.join("\n\n");
}

function buildParamDocs(
	parameters: ParsedParameter[],
	requestBody?: ParsedRequestBody,
): string | undefined {
	const lines: string[] = [];

	const pathParams = parameters.filter((p) => p.in === "path");
	const queryParams = parameters.filter((p) => p.in === "query");

	if (pathParams.length > 0) {
		lines.push("Path parameters:");
		for (const p of pathParams) {
			const desc = p.description ? ` — ${p.description}` : "";
			const req = p.required ? " (required)" : " (optional)";
			lines.push(`  • ${p.name}${req}${desc}`);
		}
	}

	if (queryParams.length > 0) {
		lines.push("Query parameters:");
		for (const p of queryParams) {
			const desc = p.description ? ` — ${p.description}` : "";
			const req = p.required ? " (required)" : " (optional)";
			lines.push(`  • ${p.name}${req}${desc}`);
		}
	}

	if (requestBody?.description) {
		lines.push(`Request body: ${requestBody.description}`);
	}

	return lines.length > 0 ? lines.join("\n") : undefined;
}

/**
 * Determine MCP tool annotations from an OpenAPI operation.
 */
export function buildAnnotations(operation: ParsedOperation): Record<string, unknown> {
	const annotations: Record<string, unknown> = {};

	if (operation.method === "get") {
		annotations.readOnlyHint = true;
	}
	if (operation.method === "delete") {
		annotations.destructiveHint = true;
	}
	if (operation.deprecated) {
		annotations.deprecated = true;
	}

	return annotations;
}

/**
 * Build a Zod shape from an OpenAPI operation's parameters and request body.
 * This is used as the `inputSchema` for MCP tool registration, allowing the SDK
 * to generate proper JSON Schema for the AI and validate incoming arguments.
 */
export function buildZodShape(operation: ParsedOperation): Record<string, z.ZodTypeAny> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const param of operation.parameters) {
		let field = jsonSchemaToZod(param.schema, param.required);
		if (param.description) field = field.describe(param.description);
		shape[param.name] = field;
	}

	if (operation.requestBody) {
		const bodySchema = operation.requestBody.schema;
		if (bodySchema.type === "object" && bodySchema.properties) {
			const props = bodySchema.properties as Record<string, Record<string, unknown>>;
			const bodyRequired = (bodySchema.required as string[] | undefined) ?? [];
			for (const [key, val] of Object.entries(props)) {
				if (!shape[key]) {
					const isRequired = bodyRequired.includes(key) || operation.requestBody.required;
					shape[key] = jsonSchemaToZod(val, isRequired);
				}
			}
		} else {
			const isRequired = operation.requestBody.required;
			let bodyField = jsonSchemaToZod(bodySchema, isRequired);
			if (operation.requestBody.description)
				bodyField = bodyField.describe(operation.requestBody.description);
			shape["body"] = bodyField;
		}
	}

	return shape;
}

function jsonSchemaToZod(schema: Record<string, unknown>, required = true): z.ZodTypeAny {
	const type = schema.type;
	let zodType: z.ZodTypeAny;

	if (Array.isArray(type)) {
		const nonNull = type.filter((t) => t !== "null") as string[];
		const hasNull = (type as unknown[]).includes("null");
		zodType = singleTypeToZod(nonNull[0], schema);
		if (hasNull) zodType = zodType.nullable();
	} else {
		zodType = singleTypeToZod(type as string | undefined, schema);
		if (schema.nullable === true) zodType = zodType.nullable();
	}

	if (!required) zodType = zodType.optional();

	return zodType;
}

function singleTypeToZod(type: string | undefined, schema: Record<string, unknown>): z.ZodTypeAny {
	switch (type) {
		case "string": {
			const enumValues = schema.enum as string[] | undefined;
			if (enumValues && enumValues.length > 0) {
				return z.enum(enumValues as [string, ...string[]]);
			}
			return z.string();
		}
		case "number":
		case "integer":
			return z.number();
		case "boolean":
			return z.boolean();
		case "array": {
			const items = schema.items as Record<string, unknown> | undefined;
			return z.array(items ? jsonSchemaToZod(items) : z.unknown());
		}
		case "object": {
			const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
			if (props) {
				const req = (schema.required as string[] | undefined) ?? [];
				const shape: Record<string, z.ZodTypeAny> = {};
				for (const [key, val] of Object.entries(props)) {
					shape[key] = jsonSchemaToZod(val, req.includes(key));
				}
				return z.object(shape).passthrough();
			}
			return z.record(z.string(), z.unknown());
		}
		default:
			return z.unknown();
	}
}

/**
 * Strip OpenAPI-specific extensions that aren't valid JSON Schema.
 * This includes `nullable`, `discriminator`, and other OpenAPI v3 keywords.
 */
function cleanSchema(schema: Record<string, unknown>): Record<string, unknown> {
	if (!schema || typeof schema !== "object") return schema;

	// Deep-clean by removing OpenAPI-specific keys that confuse JSON Schema validators
	const OPENAPI_ONLY_KEYS = new Set(["discriminator", "xml", "externalDocs", "example", "x-"]);

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(schema)) {
		if (key.startsWith("x-")) continue;
		if (OPENAPI_ONLY_KEYS.has(key)) continue;

		if (key === "nullable" && value === true) {
			// Convert OpenAPI nullable to JSON Schema anyOf with null
			continue; // handled below
		}

		if (Array.isArray(value)) {
			result[key] = value.map((item) =>
				typeof item === "object" && item !== null
					? cleanSchema(item as Record<string, unknown>)
					: item,
			);
		} else if (typeof value === "object" && value !== null) {
			result[key] = cleanSchema(value as Record<string, unknown>);
		} else {
			result[key] = value;
		}
	}

	// Handle nullable
	if (schema.nullable === true) {
		const type = result.type;
		if (type && typeof type === "string") {
			result.type = [type, "null"];
		}
	}

	return result;
}
