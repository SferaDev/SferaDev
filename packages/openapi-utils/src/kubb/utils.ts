import { pluginTsName } from "@kubb/plugin-ts";
import type { ast, GeneratorContext } from "kubb/kit";
import type { PluginClient } from "./plugin";

export type ClientContext = GeneratorContext<PluginClient>;

type FileEntry = { path: string; baseName: string };

function entryFor(node: ast.HttpOperationNode) {
	return {
		name: node.operationId,
		extname: ".ts" as const,
		tag: node.tags[0] ?? "default",
		path: node.path,
	};
}

/** The generated operation file for `node`, in this plugin's own output tree. */
export function clientFile(ctx: ClientContext, node: ast.HttpOperationNode) {
	return ctx.resolver.file({ ...entryFor(node), root: ctx.root, output: ctx.options.output });
}

/** The `plugin-ts` file holding the types `node`'s operation imports. */
export function typesFile(ctx: ClientContext, node: ast.HttpOperationNode) {
	const output = ctx.requirePlugin(pluginTsName).options?.output ?? ctx.options.output;
	return ctx.getResolver(pluginTsName).file({ ...entryFor(node), root: ctx.root, output });
}

export function operationName(ctx: ClientContext, node: ast.HttpOperationNode): string {
	return ctx.resolver.name(node.operationId);
}

/**
 * `banner`/`footer` moved onto `resolver.default` in kubb 5 and now take the input meta plus the
 * file being written, rather than the adapter's input node.
 */
export function fileBanner(ctx: ClientContext, file: FileEntry) {
	const context = { output: ctx.options.output, config: ctx.config, file };
	return {
		banner: ctx.resolver.default.banner(ctx.meta, context),
		footer: ctx.resolver.default.footer(ctx.meta, context),
	};
}
