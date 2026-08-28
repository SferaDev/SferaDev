import { adapterOas } from "@kubb/adapter-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import type { UserConfig } from "kubb";
import { pluginClient } from "./plugin";

interface ConfigOptions {
	outputPath?: string;
	importPath?: string;
	skipZod?: boolean;
}

function buildConfig({
	outputPath = "./src/generated",
	importPath = "../utils/fetcher",
	skipZod = false,
}: ConfigOptions = {}): Omit<UserConfig, "input"> {
	return {
		root: ".",
		adapter: adapterOas({
			validate: false,
			server: { index: 0 },
			contentType: "application/json",
			dateType: "string",
			unknownType: "unknown",
			enumSuffix: "Enum",
		}),
		output: {
			path: outputPath,
			format: "biome",
			lint: false,
			clean: true,
			// kubb's `format` only runs `biome format`, which leaves import order alone. CI gates on
			// `biome check`, whose organizeImports assist does sort them — so without this the tree is
			// red the moment anything is regenerated.
			postGenerate: [`biome check --write ${outputPath}`],
		},
		plugins: [
			pluginTs({
				output: {
					path: "./types.ts",
					mode: "file",
				},
				enum: { type: "asConst" },
				optionalType: "questionTokenAndUndefined",
			}),
			pluginClient({
				output: {
					path: "./components.ts",
					mode: "file",
				},
				importPath,
			}),
			...(skipZod
				? []
				: [
						pluginZod({
							output: {
								path: "./schemas.ts",
								mode: "file",
								banner: "// @ts-nocheck",
							},
							importPath: "zod",
						}),
					]),
		],
	};
}

export const baseConfig: Omit<UserConfig, "input"> = buildConfig();

export function createConfig(options: ConfigOptions): Omit<UserConfig, "input"> {
	return buildConfig(options);
}
