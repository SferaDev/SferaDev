import { defineConfig } from "@kubb/core";
import { baseConfig, fetchSpec, renameReservedWords } from "@sferadev/openapi-utils";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec("https://open-api.netlify.com/swagger.json");

	openAPIDocument = renameReservedWords(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});
