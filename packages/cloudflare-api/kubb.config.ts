import { defineConfig } from "@kubb/core";
import { baseConfig } from "@sferadev/openapi-utils";
import c from "case";
import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts/oas30";

export default defineConfig(async () => {
	const response = await fetch(
		"https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
	);
	let openAPIDocument: OpenAPIObject = await response.json();

	// Add missing operation ids and clean them
	openAPIDocument = cleanOperationIds({ openAPIDocument });

	// Remove duplicated schemas
	openAPIDocument = deduplicateComponents(openAPIDocument, "schemas");

	// Remove duplicated parameters
	openAPIDocument = deduplicateComponents(openAPIDocument, "parameters");

	// Remove duplicated responses
	openAPIDocument = deduplicateComponents(openAPIDocument, "responses");

	// Rewrite status code in components response with XX suffix to avoid invalid identifier (4XX -> 400, 5XX -> 500)
	for (const [_, definition] of Object.entries(openAPIDocument.paths ?? {})) {
		for (const [_, operation] of Object.entries(definition as PathItemObject)) {
			const responses = (operation as OperationObject).responses;
			if (responses) {
				for (const [statusCode, response] of Object.entries(responses)) {
					if (statusCode.endsWith("XX")) {
						const newStatusCode = `${statusCode.slice(0, 1)}00`;
						responses[newStatusCode] = response;
						delete responses[statusCode];
					}
				}
			}
		}
	}

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});

function cleanOperationIds({ openAPIDocument }: { openAPIDocument: OpenAPIObject }) {
	for (const [key, path] of Object.entries(
		openAPIDocument.paths as Record<string, PathItemObject>,
	)) {
		for (const method of ["get", "put", "post", "patch", "delete"] as const) {
			if (path[method]) {
				const operationId = path[method].operationId ?? `${method} ${key}`;
				openAPIDocument.paths[key][method] = {
					...openAPIDocument.paths[key][method],
					operationId: c.camel(operationId),
				};
			}
		}
	}

	return openAPIDocument;
}

function deduplicateComponents(
	openAPIDocument: OpenAPIObject,
	componentType: "schemas" | "parameters" | "responses",
) {
	const components = openAPIDocument.components?.[componentType] ?? {};
	const count: Record<string, number> = {};
	const rewrites = new Map<string, string>();

	for (const path of Object.keys(components)) {
		const name = c.pascal(path);
		if (count[name] === undefined) {
			count[name] = 0;
		}

		count[name] += 1;
		if (count[name] > 1 && openAPIDocument.components?.[componentType]?.[path]) {
			const newPath = `${path}-${count[name]}`;
			rewrites.set(path, newPath);
			(openAPIDocument.components[componentType] as Record<string, unknown>)[newPath] = (
				openAPIDocument.components[componentType] as Record<string, unknown>
			)[path];
			delete (openAPIDocument.components[componentType] as Record<string, unknown>)[path];
		}
	}

	// Rewrite all $ref in the document with new names
	for (const [ref, newRef] of rewrites) {
		openAPIDocument = JSON.parse(
			JSON.stringify(openAPIDocument).replace(
				new RegExp(`"#/components/${componentType}/${ref}"`, "g"),
				`"#/components/${componentType}/${newRef}"`,
			),
		);
	}

	return openAPIDocument;
}
