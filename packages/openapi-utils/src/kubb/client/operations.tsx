import { pluginTsName } from "@kubb/plugin-ts";
import { File, jsxRenderer } from "kubb/jsx";
import { ast, defineGenerator } from "kubb/kit";
import { ClientOperation, resolveTypeSchemas } from "../components/client-operation";
import type { PluginClient } from "../plugin";
import { clientFile, fileBanner, operationName, typesFile } from "../utils";

export const clientGenerator = defineGenerator<PluginClient>({
	name: "client",
	renderer: jsxRenderer,
	operation(node, ctx) {
		if (!ast.isHttpOperationNode(node)) return null;

		const { importPath } = ctx.options;
		const file = clientFile(ctx, node);
		const typeSchemas = resolveTypeSchemas(node, ctx.getResolver(pluginTsName));

		const typeImportNames = Array.from(
			new Set(
				[
					typeSchemas.request?.name,
					typeSchemas.response.name,
					...typeSchemas.errors.map((error) => error.name),
				].filter((name): name is string => Boolean(name)),
			),
		);

		return (
			<File baseName={file.baseName} path={file.path} meta={file.meta} {...fileBanner(ctx, file)}>
				<File.Import name="defaultClient" path={importPath} />
				<File.Import name={["FetcherConfig", "ErrorWrapper"]} path={importPath} isTypeOnly />

				{typeImportNames.length > 0 ? (
					<File.Import
						name={typeImportNames}
						root={file.path}
						path={typesFile(ctx, node).path}
						isTypeOnly
					/>
				) : null}

				<ClientOperation name={operationName(ctx, node)} node={node} typeSchemas={typeSchemas} />
			</File>
		);
	},
});
