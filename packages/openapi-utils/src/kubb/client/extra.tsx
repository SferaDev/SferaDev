import c from "case";
import { File, jsxRenderer } from "kubb/jsx";
import { ast, defineGenerator } from "kubb/kit";
import type { PluginClient } from "../plugin";
import { clientFile, fileBanner, operationName } from "../utils";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

function isWriteOrReadMethod(method: string): method is HttpMethod {
	return (HTTP_METHODS as readonly string[]).includes(method);
}

export const extraGenerator = defineGenerator<PluginClient>({
	name: "extra",
	renderer: jsxRenderer,
	operations(nodes, ctx) {
		const operations = nodes.filter((node) => ast.isHttpOperationNode(node));

		const file = ctx.resolver.file({
			name: "extra",
			extname: ".ts",
			root: ctx.root,
			output: ctx.options.output,
		});

		const getOpName = (node: ast.HttpOperationNode) => operationName(ctx, node);

		const imports = operations.map((node) => {
			const name = getOpName(node);
			const opFile = clientFile(ctx, node);

			return <File.Import key={name} name={[name]} root={file.path} path={opFile.path} />;
		});

		const tags = Array.from(new Set(operations.flatMap((node) => node.tags)));

		const eligible = operations.filter(
			(node) => isWriteOrReadMethod(node.method) && node.operationId !== undefined,
		);

		const operationsByPath = Object.fromEntries(
			eligible.map((node) => [`${node.method.toUpperCase()} ${node.path}`, getOpName(node)]),
		);

		const operationsByTag = Object.fromEntries(
			tags.map((name) => [
				c.camel(name.toLowerCase()),
				operations.filter((node) => node.tags.includes(name)).map(getOpName),
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
			<File baseName={file.baseName} path={file.path} meta={file.meta} {...fileBanner(ctx, file)}>
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
