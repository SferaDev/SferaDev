import { type ast, defineGenerator } from "@kubb/core";
import type { PluginClient } from "@kubb/plugin-client";
import { pluginClientName } from "@kubb/plugin-client";
import { File, jsxRenderer } from "@kubb/renderer-jsx";
import c from "case";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

function isWriteOrReadMethod(method: string): method is HttpMethod {
	return (HTTP_METHODS as readonly string[]).includes(method);
}

export const extraGenerator = defineGenerator<PluginClient>({
	name: "extra",
	renderer: jsxRenderer,
	operations(nodes, ctx) {
		const { adapter, config, resolver, root } = ctx;
		const { output, group } = ctx.options;
		const clientResolver = ctx.driver.getResolver(pluginClientName);

		const file = resolver.resolveFile({ name: "extra", extname: ".ts" }, { root, output, group });

		const imports = nodes.map((node) => {
			const name = clientResolver.resolveName(node.operationId);
			const opFile = clientResolver.resolveFile(
				{
					name: node.operationId,
					extname: ".ts",
					tag: node.tags[0] ?? "default",
					path: node.path,
				},
				{ root, output, group },
			);

			return <File.Import key={name} name={[name]} root={file.path} path={opFile.path} />;
		});

		const getOpName = (node: ast.OperationNode) => clientResolver.resolveName(node.operationId);

		const tags = Array.from(new Set(nodes.flatMap((node) => node.tags)));

		const eligible = nodes.filter(
			(node) => isWriteOrReadMethod(node.method) && node.operationId !== undefined,
		);

		const operationsByPath = Object.fromEntries(
			eligible.map((node) => [`${node.method.toUpperCase()} ${node.path}`, getOpName(node)]),
		);

		const operationsByTag = Object.fromEntries(
			tags.map((name) => [
				c.camel(name.toLowerCase()),
				nodes.filter((node) => node.tags.includes(name)).map(getOpName),
			]),
		);

		const tagDictionary = Object.fromEntries(
			tags.map((name) => [
				c.camel(name.toLowerCase()),
				eligible
					.filter((node) => node.tags.includes(name))
					.reduce(
						(acc, node) => {
							const method = node.method.toUpperCase();
							acc[method] = acc[method] ?? [];
							acc[method].push(getOpName(node));
							return acc;
						},
						{} as Record<string, string[]>,
					),
			]),
		);

		return (
			<File
				baseName={file.baseName}
				path={file.path}
				meta={file.meta}
				banner={resolver.resolveBanner(adapter.inputNode, { output, config })}
				footer={resolver.resolveFooter(adapter.inputNode, { output, config })}
			>
				{imports}

				<File.Source>
					{`
export const operationsByPath = {
${Object.entries(operationsByPath)
	.map(([path, op]) => `\t"${path}": ${op}`)
	.join(",\n")}
};

export const operationsByTag = {
${Object.entries(operationsByTag)
	.map(
		([tag, ops]) => `\t"${tag}": {
${ops.map((op) => `\t\t${op}`).join(",\n")}
\t}`,
	)
	.join(",\n")}
};

export const tagDictionary = {
${Object.entries(tagDictionary)
	.map(([tag, ops]) => `\t"${tag}": ${JSON.stringify(ops, null, 2)}`)
	.join(",\n")}
} as const;
`}
				</File.Source>
			</File>
		);
	},
});
