import { defineConfig } from "@kubb/core";
import { baseConfig, fetchSpec } from "@sferadev/openapi-utils";
import c from "case";
import type { OpenAPIObject, PathItemObject, SchemaObject } from "openapi3-ts/oas30";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec("https://api.nuki.io/static/swagger/swagger.json");

	openAPIDocument = cleanOperationIds(openAPIDocument);
	openAPIDocument = fixInvalidTypes(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});

function cleanOperationIds(openAPIDocument: OpenAPIObject) {
	for (const [key, path] of Object.entries(
		openAPIDocument.paths as Record<string, PathItemObject>,
	)) {
		for (const method of ["get", "put", "post", "patch", "delete"] as const) {
			if (path[method]) {
				const defaultOperationId = path[method].operationId ?? `${method} ${key}`;
				const operationId = `${method} ${defaultOperationId.split("_")[0]}`;
				openAPIDocument.paths[key][method] = {
					...openAPIDocument.paths[key][method],
					operationId: c.camel(operationId),
				};
			}
		}
	}

	return openAPIDocument;
}

function fixInvalidTypes(openAPIDocument: OpenAPIObject) {
	function fixSchema(schema: SchemaObject): void {
		if (!schema || typeof schema !== "object") return;

		if ((schema as any).type === "int") {
			(schema as any).type = "integer";
		}

		if (schema.properties) {
			for (const prop of Object.values(schema.properties)) {
				fixSchema(prop as SchemaObject);
			}
		}
		if (schema.items) fixSchema(schema.items as SchemaObject);
		for (const key of ["allOf", "oneOf", "anyOf"] as const) {
			if (schema[key]) {
				for (const s of schema[key] as SchemaObject[]) fixSchema(s);
			}
		}
		if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
			fixSchema(schema.additionalProperties as SchemaObject);
		}
	}

	// Fix schemas in components (OpenAPI 3.0)
	if (openAPIDocument.components?.schemas) {
		for (const schema of Object.values(openAPIDocument.components.schemas)) {
			fixSchema(schema as SchemaObject);
		}
	}

	// Fix schemas in definitions (Swagger 2.0)
	if ((openAPIDocument as any).definitions) {
		for (const schema of Object.values((openAPIDocument as any).definitions)) {
			fixSchema(schema as SchemaObject);
		}
	}

	// Fix schemas in parameters
	if (openAPIDocument.components?.parameters) {
		for (const param of Object.values(openAPIDocument.components.parameters)) {
			if ((param as any).schema) fixSchema((param as any).schema as SchemaObject);
		}
	}

	// Fix inline parameters and request bodies in paths
	for (const path of Object.values(openAPIDocument.paths ?? {})) {
		// Path-level parameters
		if ((path as any).parameters) {
			for (const param of (path as any).parameters) {
				if ((param as any).schema) fixSchema((param as any).schema as SchemaObject);
				if ((param as any).type === "int") (param as any).type = "integer";
			}
		}

		for (const method of ["get", "put", "post", "patch", "delete"] as const) {
			const operation = (path as PathItemObject)[method];
			if (operation?.parameters) {
				for (const param of operation.parameters) {
					if ((param as any).schema) fixSchema((param as any).schema as SchemaObject);
					if ((param as any).type === "int") (param as any).type = "integer";
				}
			}
			if (operation?.requestBody) {
				const content = (operation.requestBody as any).content;
				if (content) {
					for (const mediaType of Object.values(content)) {
						if ((mediaType as any).schema) fixSchema((mediaType as any).schema as SchemaObject);
					}
				}
			}
		}
	}

	return openAPIDocument;
}
