import { adapterOas } from "@kubb/adapter-oas";
import type { UserConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { extraGenerator } from "./client/extra";
import { clientGenerator } from "./client/operations";

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
			serverIndex: 0,
			contentType: "application/json",
			dateType: "string",
			unknownType: "unknown",
			enumSuffix: "Enum",
		}),
		output: {
			path: outputPath,
			extension: {
				".ts": "",
			},
			format: "biome",
			lint: false,
			clean: true,
		},
		plugins: [
			pluginTs({
				output: {
					path: "./types.ts",
				},
				enumType: "asConst",
				optionalType: "questionTokenAndUndefined",
			}),
			pluginClient({
				output: {
					path: "./components.ts",
				},
				dataReturnType: "data",
				paramsType: "object",
				urlType: "export",
				importPath,
				generators: [clientGenerator, extraGenerator],
			}),
			...(skipZod
				? []
				: [
						pluginZod({
							output: {
								path: "./schemas.ts",
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
