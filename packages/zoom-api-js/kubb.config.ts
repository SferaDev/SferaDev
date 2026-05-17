import { baseConfig, cleanOperationIds, fetchSpec } from "@sferadev/openapi-utils";
import { defineConfig } from "kubb";

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
