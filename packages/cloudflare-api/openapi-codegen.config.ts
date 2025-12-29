import { defineConfig } from "@openapi-codegen/cli";
import type { Context } from "@openapi-codegen/cli/lib/types";
import { generateFetchers, generateSchemaTypes } from "@openapi-codegen/typescript";
import Case from "case";
import type { OperationObject, PathItemObject } from "openapi3-ts/oas30";
import { Project, VariableDeclarationKind } from "ts-morph";
import ts from "typescript";

export default defineConfig({
	cloudflare: {
		from: {
			source: "url",
			url: "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
		},
		outputDir: "src/api",
		to: async (context) => {
			const filenamePrefix = "";

			// Add missing operation ids and clean them
			context.openAPIDocument = cleanOperationIds({ openAPIDocument: context.openAPIDocument });

			// Remove duplicated schemas
			context.openAPIDocument = deduplicateComponents(context.openAPIDocument, "schemas");

			// Remove duplicated parameters
			context.openAPIDocument = deduplicateComponents(context.openAPIDocument, "parameters");

			// Remove duplicated responses
			context.openAPIDocument = deduplicateComponents(context.openAPIDocument, "responses");

			// Rewrite status code in components response with XX suffix to avoid invalid identifier (4XX -> 400, 5XX -> 500)
			for (const [_, definition] of Object.entries(context.openAPIDocument.paths ?? {})) {
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

			const { schemasFiles } = await generateSchemaTypes(context, { filenamePrefix });
			await generateFetchers(context, { filenamePrefix, schemasFiles });
			await context.writeFile("extra.ts", buildExtraFile(context));
		},
	},
});

function buildExtraFile(context: Context) {
	const project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: { module: ts.ModuleKind.ESNext as any, target: ts.ScriptTarget.ES2020 },
	});

	const sourceFile = project.createSourceFile("extra.ts");

	const operationsByPath = Object.fromEntries(
		Object.entries(context.openAPIDocument.paths ?? {}).flatMap(([path, methods]) => {
			return Object.entries(methods)
				.filter(([method]) =>
					["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()),
				)
				.map(([method, operation]: [string, any]) => [
					`${method.toUpperCase()} ${path}`,
					operation.operationId,
				]);
		}),
	);

	sourceFile.addImportDeclaration({
		namedImports: Object.values(operationsByPath),
		moduleSpecifier: "./components",
	});

	sourceFile.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: "operationsByPath",
				initializer: `{
            ${Object.entries(operationsByPath)
							.map(([path, operation]) => `"${path}": ${operation}`)
							.join(",\n")}
        }`,
			},
		],
	});

	return sourceFile.getFullText();
}

function cleanOperationIds({ openAPIDocument }: { openAPIDocument: Context["openAPIDocument"] }) {
	for (const [key, path] of Object.entries(
		openAPIDocument.paths as Record<string, PathItemObject>,
	)) {
		for (const method of ["get", "put", "post", "patch", "delete"] as const) {
			if (path[method]) {
				const operationId = path[method].operationId ?? `${method} ${key}`;
				openAPIDocument.paths[key][method] = {
					...openAPIDocument.paths[key][method],
					operationId: Case.camel(operationId),
				};
			}
		}
	}

	return openAPIDocument;
}

function deduplicateComponents(
	openAPIDocument: Context["openAPIDocument"],
	componentType: "schemas" | "parameters" | "responses",
) {
	const components = openAPIDocument.components?.[componentType] ?? {};
	const count: Record<string, number> = {};
	const rewrites = new Map<string, string>();

	for (const path of Object.keys(components)) {
		const name = Case.pascal(path);
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
