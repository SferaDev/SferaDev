import { defineConfig } from "@kubb/core";
import {
	addMissingPathParams,
	baseConfig,
	camelCaseProperties,
	cleanOperationIds,
	fetchSpec,
	fixArrayItems,
	fixUnionConstraints,
	sortArrays,
} from "@sferadev/openapi-utils";
import type { OpenAPIObject } from "openapi3-ts/oas30";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec("https://api.v0.dev/v1/openapi.json");

	openAPIDocument = addMissingPathParams(openAPIDocument);
	openAPIDocument = cleanOperationIds(openAPIDocument, { deleteHead: true });
	openAPIDocument = sortArrays(openAPIDocument);
	openAPIDocument = fixWrongGroupIds(openAPIDocument);
	openAPIDocument = fixArrayItems(openAPIDocument);
	openAPIDocument = fixUnionConstraints(openAPIDocument);
	openAPIDocument = camelCaseProperties(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});

function fixWrongGroupIds(openAPIDocument: OpenAPIObject) {
	return JSON.parse(JSON.stringify(openAPIDocument), (key, value) => {
		if (key === "groupIds" && value.maxItems === 0 && value.minItems === 0) {
			return {
				items: { oneOf: [{ type: "string" }, { type: "string" }] },
				maxItems: 2,
				minItems: 2,
				type: "array",
			};
		}
		return value;
	});
}
