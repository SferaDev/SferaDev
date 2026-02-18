import fs from "node:fs";
import { defineConfig } from "@kubb/core";
import {
	camelCasePathParams,
	cleanOperationIds,
	createConfig,
	fetchSpec,
	sortArrays,
} from "@sferadev/openapi-utils";
import type { OpenAPIObject, PathItemObject } from "openapi3-ts/oas30";
import yaml from "yaml";

export default defineConfig(async () => {
	let adminSpec = await fetchSpec("https://www.keycloak.org/docs-api/latest/rest-api/openapi.json");
	adminSpec = transformSpec(adminSpec);

	const accountYaml = fs.readFileSync("./specs/account.yaml", "utf-8");
	let accountSpec = yaml.parse(accountYaml);
	accountSpec = transformSpec(accountSpec);

	return [
		{
			...createConfig({
				outputPath: "./src/admin/generated",
				importPath: "../../utils/fetcher",
			}),
			input: { data: adminSpec },
		},
		{
			...createConfig({
				outputPath: "./src/account/generated",
				importPath: "../../utils/fetcher",
			}),
			input: { data: accountSpec },
		},
	];
});

function transformSpec(spec: OpenAPIObject): OpenAPIObject {
	spec = cleanOperationIds(spec);
	spec = camelCasePathParams(spec);
	spec = sortArrays(spec);
	warnForDuplicatedPathParameters(spec);
	return spec;
}

function warnForDuplicatedPathParameters(openAPIDocument: OpenAPIObject) {
	for (const path of Object.keys(openAPIDocument.paths as Record<string, PathItemObject>)) {
		const pathParameters = path.match(/{([^}]+)}/g)?.map((param) => param.slice(1, -1)) ?? [];
		const duplicated = pathParameters.filter(
			(param, index) => pathParameters.indexOf(param) !== index,
		);
		if (duplicated.length > 0) {
			console.warn(`Duplicated path parameters in path "${path}": ${duplicated.join(", ")}`);
		}
	}
}
