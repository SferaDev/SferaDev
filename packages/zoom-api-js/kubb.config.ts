import { defineConfig } from "@kubb/core";
import { baseConfig, cleanOperationIds, fetchSpec } from "@sferadev/openapi-utils";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec(
		"https://developers.zoom.us/api-hub/meetings/methods/endpoints.json",
	);

	openAPIDocument = cleanOperationIds(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});
