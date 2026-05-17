import { defineGenerator } from "@kubb/core";
import type { PluginClient } from "@kubb/plugin-client";
import { pluginTsName } from "@kubb/plugin-ts";
import { pluginZodName } from "@kubb/plugin-zod";
import { File, jsxRenderer } from "@kubb/renderer-jsx";
import {
	ClientOperation,
	resolveTypeSchemas,
	resolveZodSchemas,
} from "../components/client-operation";

export const clientGenerator = defineGenerator<PluginClient>({
	name: "client",
	renderer: jsxRenderer,
	operation(node, ctx) {
		const { adapter, config, resolver, root } = ctx;
		const { output, group, importPath, parser, baseURL, paramsCasing } = ctx.options;

		const tsPlugin = ctx.getPlugin(pluginTsName);
		if (!tsPlugin) return null;
		const tsResolver = ctx.getResolver(pluginTsName);

		const file = resolver.resolveFile(
			{
				name: node.operationId,
				extname: ".ts",
				tag: node.tags[0] ?? "default",
				path: node.path,
			},
			{ root, output, group },
		);

		const urlName = resolver.resolveUrlName(node);
		const name = resolver.resolveName(node.operationId);

		const tsFile = tsResolver.resolveFile(
			{
				name: node.operationId,
				extname: ".ts",
				tag: node.tags[0] ?? "default",
				path: node.path,
			},
			{ root, output: tsPlugin.options?.output ?? output, group: tsPlugin.options?.group },
		);

		const typeSchemas = resolveTypeSchemas(node, tsResolver);

		const zodPlugin = parser === "zod" ? ctx.getPlugin(pluginZodName) : undefined;
		const zodResolver = zodPlugin ? ctx.getResolver(pluginZodName) : undefined;
		const zodFile =
			zodPlugin && zodResolver
				? zodResolver.resolveFile(
						{
							name: node.operationId,
							extname: ".ts",
							tag: node.tags[0] ?? "default",
							path: node.path,
						},
						{ root, output: zodPlugin.options?.output ?? output, group: zodPlugin.options?.group },
					)
				: undefined;
		const zodSchemas =
			parser === "zod" && zodResolver ? resolveZodSchemas(node, zodResolver) : undefined;

		const typeImportNames = [
			typeSchemas.request?.name,
			typeSchemas.response.name,
			...typeSchemas.errors.map((e) => e.name),
		].filter((n): n is string => Boolean(n));

		const zodImportNames =
			zodSchemas && zodFile
				? [zodSchemas.response.name, zodSchemas.request?.name].filter((n): n is string =>
						Boolean(n),
					)
				: [];

		return (
			<File
				baseName={file.baseName}
				path={file.path}
				meta={file.meta}
				banner={resolver.resolveBanner(adapter.inputNode, { output, config })}
				footer={resolver.resolveFooter(adapter.inputNode, { output, config })}
			>
				{importPath ? <File.Import name="defaultClient" path={importPath} /> : null}
				{importPath ? (
					<File.Import name={["FetcherConfig", "ErrorWrapper"]} path={importPath} isTypeOnly />
				) : null}

				{zodSchemas && zodFile && zodImportNames.length > 0 ? (
					<File.Import name={zodImportNames} root={file.path} path={zodFile.path} />
				) : null}

				{typeImportNames.length > 0 ? (
					<File.Import
						name={Array.from(new Set(typeImportNames))}
						root={file.path}
						path={tsFile.path}
						isTypeOnly
					/>
				) : null}

				<ClientOperation
					name={name}
					urlName={urlName}
					baseURL={baseURL}
					paramsCasing={paramsCasing}
					typeSchemas={typeSchemas}
					node={node}
					parser={parser}
					zodSchemas={zodSchemas}
				/>
			</File>
		);
	},
});
