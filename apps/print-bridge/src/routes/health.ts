import { Hono } from "hono";
import type { BridgeContext } from "./context.js";

/** Liveness + at-a-glance status, unauthenticated (used by kiosk ping). */
export function healthRoutes(ctx: BridgeContext): Hono {
	const app = new Hono();

	app.get("/", (c) =>
		c.json({
			status: "ok",
			uptime: Math.floor((Date.now() - ctx.startedAt) / 1000),
			jobsPending: ctx.queue.countPending(),
			jobsFailed: ctx.queue.countFailed(),
			printerCount: ctx.registry.list().length,
		}),
	);

	return app;
}
