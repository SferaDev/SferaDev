import { serve } from "@hono/node-server";
import { env } from "./env.js";
import app from "./index.js";

// Standalone Node entrypoint for local development and non-Vercel hosts.
// On Vercel the default-exported app in `index.ts` is used directly and this
// file is ignored. Named `dev-server.ts` (not `server.ts`) so it is not picked
// up as a Vercel framework entrypoint.

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
	console.log(`Platform service running on http://localhost:${info.port}`);
});

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
