import { baseConfig, fetchSpec, renameReservedWords } from "@sferadev/openapi-utils";
import { defineConfig } from "kubb";

export default defineConfig(async () => {
	let openAPIDocument = await fetchSpec("https://open-api.netlify.com/swagger.json");

	openAPIDocument = renameReservedWords(openAPIDocument);

	return {
		...baseConfig,
		input: { data: openAPIDocument },
	};
});
