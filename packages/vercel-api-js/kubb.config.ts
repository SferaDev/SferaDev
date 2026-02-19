import { defineConfig } from "@kubb/core";
import {
	addMissingPathParams,
	baseConfig,
	camelCaseProperties,
	cleanOperationIds,
	fetchSpec,
	fixArrayItems,
	fixUnionConstraints,
	sanitizeEnumValues,
	sortArrays,
} from "@sferadev/openapi-utils";
import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts/oas30";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec("https://openapi.vercel.sh");

	openAPIDocument = addMissingPathParams(openAPIDocument);
	openAPIDocument = cleanOperationIds(openAPIDocument, {
		deleteHead: true,
		hardcodedOperationIds,
	});

	openAPIDocument = updateMethod(openAPIDocument, "/v1/integrations/search-repo", "get", (op) => ({
		...op,
		operationId: "searchRepo",
	}));
	openAPIDocument = updateMethod(
		openAPIDocument,
		"/v1/projects/{projectId}/promote/aliases",
		"get",
		(op) => ({ ...op, operationId: "listPromoteAliases" }),
	);

	openAPIDocument = sortArrays(openAPIDocument);
	openAPIDocument = fixWrongGroupIds(openAPIDocument);
	openAPIDocument = fixArrayItems(openAPIDocument);
	openAPIDocument = fixUnionConstraints(openAPIDocument);
	openAPIDocument = sanitizeEnumValues(openAPIDocument);
	openAPIDocument = camelCaseProperties(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});

function updateMethod(
	openAPIDocument: OpenAPIObject,
	path: string,
	method: string,
	update: (operation: OperationObject) => OperationObject,
) {
	const pathItem = openAPIDocument.paths?.[path];
	if (!pathItem) return openAPIDocument;

	const operation = pathItem[method as keyof PathItemObject] as OperationObject;
	if (!operation) return openAPIDocument;

	(openAPIDocument.paths[path] as any)[method] = { ...operation, ...update(operation) };

	return openAPIDocument;
}

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

const hardcodedOperationIds: Record<string, string> = {
	"DELETE /data-cache/purge-all": "purgeAllDataCache",
	"PATCH /data-cache/billing-settings": "updateDataCacheBillingSettings",
	"POST /v1/installations/{integrationConfigurationId}/resources/{resourceId}/experimentation/items":
		"createExperimentationItem",
	"PATCH /v1/installations/{integrationConfigurationId}/resources/{resourceId}/experimentation/items/{itemId}":
		"updateExperimentationItem",
	"DELETE /v1/installations/{integrationConfigurationId}/resources/{resourceId}/experimentation/items/{itemId}":
		"deleteExperimentationItem",
	"PUT /v1/installations/{integrationConfigurationId}/resources/{resourceId}/experimentation/edge-config":
		"updateExperimentationEdgeConfig",
	"GET /v9/projects/{idOrName}/custom-environments": "listCustomEnvironments",
	"GET /certs": "listCerts",
};
