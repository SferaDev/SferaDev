import type { UserConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
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
			pluginOas({
				validate: false,
				output: {
					path: "./json",
					barrelType: false,
				},
				serverIndex: 0,
				contentType: "application/json",
			}),
			pluginTs({
				output: {
					path: "./types.ts",
					barrelType: false,
				},
				enumType: "asConst",
				enumSuffix: "Enum",
				dateType: "string",
				unknownType: "unknown",
				optionalType: "questionTokenAndUndefined",
			}),
			pluginClient({
				output: {
					path: "./components.ts",
					barrelType: false,
				},
				client: "fetch",
				dataReturnType: "data",
				pathParamsType: "object",
				paramsType: "object",
				urlType: "export",
				importPath,
				generators: [clientGenerator, extraGenerator] as any[], // Workaround for generator mismatches
			}),
			...(skipZod
				? []
				: [
						pluginZod({
							output: {
								path: "./schemas.ts",
								barrelType: false,
							},
							dateType: "string",
							unknownType: "unknown",
							importPath: "zod",
							version: "4",
						}),
					]),
		],
	};
}

export const baseConfig: Omit<UserConfig, "input"> = buildConfig();

export function createConfig(options: ConfigOptions): Omit<UserConfig, "input"> {
	return buildConfig(options);
}
