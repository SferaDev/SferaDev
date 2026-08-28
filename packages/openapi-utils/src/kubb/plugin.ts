import { pluginTsName } from "@kubb/plugin-ts";
import { definePlugin, type Output, type PluginFactoryOptions } from "kubb/kit";
import { extraGenerator } from "./client/extra";
import { clientGenerator } from "./client/operations";

/**
 * kubb 5 stable dropped `@kubb/plugin-client` (it never left the 5.0.0 beta line and its
 * published `latest` is still on 4.x). Everything we used it for was the plugin shell — the
 * two generators below have always been ours — so the shell now lives here.
 */
type Options = {
	output: Output;
	/** Module the generated operations import `defaultClient`, `FetcherConfig` and `ErrorWrapper` from. */
	importPath: string;
};

export const pluginClientName = "plugin-client";

export type PluginClient = PluginFactoryOptions<typeof pluginClientName, Options, Options>;

declare global {
	namespace Kubb {
		interface PluginRegistry {
			"plugin-client": PluginClient;
		}
	}
}

export const pluginClient = definePlugin<PluginClient>((options) => {
	return {
		name: pluginClientName,
		options,
		dependencies: [pluginTsName],
		hooks: {
			"kubb:plugin:setup"(ctx) {
				ctx.setOptions(options);
				ctx.addGenerator(clientGenerator, extraGenerator);
			},
		},
	};
});
