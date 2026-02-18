import { defineConfig } from "@kubb/core";
import {
	camelCasePathParams,
	cleanOperationIds,
	createConfig,
	fetchSpec,
} from "@sferadev/openapi-utils";
import c from "case";
import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts/oas30";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec(
		"https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
	);

	openAPIDocument = cleanOperationIds(openAPIDocument);
	openAPIDocument = camelCasePathParams(openAPIDocument);

	openAPIDocument = deduplicateComponents(openAPIDocument, "schemas");
	openAPIDocument = deduplicateComponents(openAPIDocument, "parameters");
	openAPIDocument = deduplicateComponents(openAPIDocument, "responses");

	// Rewrite status codes: 4XX -> 400, 5XX -> 500
	for (const definition of Object.values(openAPIDocument.paths ?? {})) {
		for (const operation of Object.values(definition as PathItemObject)) {
			const responses = (operation as OperationObject).responses;
			if (responses) {
				for (const [statusCode, response] of Object.entries(responses)) {
					if (statusCode.endsWith("XX")) {
						responses[`${statusCode.slice(0, 1)}00`] = response;
						delete responses[statusCode];
					}
				}
			}
		}
	}

	return {
		...createConfig({ skipZod: true }),
		input: { data: openAPIDocument },
	};
});

function deduplicateComponents(
	openAPIDocument: OpenAPIObject,
	componentType: "schemas" | "parameters" | "responses",
) {
	const components = openAPIDocument.components?.[componentType] ?? {};
	const count: Record<string, number> = {};
	const rewrites = new Map<string, string>();

	for (const path of Object.keys(components)) {
		const name = c.pascal(path);
		count[name] = (count[name] ?? 0) + 1;
		if (count[name] > 1 && openAPIDocument.components?.[componentType]?.[path]) {
			const newPath = `${path}-${count[name]}`;
			rewrites.set(path, newPath);
			(openAPIDocument.components[componentType] as Record<string, unknown>)[newPath] = (
				openAPIDocument.components[componentType] as Record<string, unknown>
			)[path];
			delete (openAPIDocument.components[componentType] as Record<string, unknown>)[path];
		}
	}

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
