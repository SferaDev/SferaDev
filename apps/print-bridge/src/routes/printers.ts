import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { BridgeContext } from "./context.js";

/** Printer discovery + live status endpoints. */
export function printerRoutes(ctx: BridgeContext): Hono {
	const app = new Hono();

	// List all discovered printers, refreshing their live state first.
	app.get("/", async (c) => {
		await ctx.registry.refreshAll();
		return c.json(ctx.registry.list());
	});

	// Live status for a single printer.
	app.get("/:id/status", async (c) => {
		const id = c.req.param("id");
		const printer = await ctx.registry.refresh(id);
		if (!printer) {
			throw new HTTPException(404, { message: "Printer not found" });
		}
		return c.json(printer);
	});

	// Re-query the network for printers over mDNS.
	app.post("/discover", (c) => {
		ctx.mdns.rediscover();
		return c.json({ status: "discovering", printers: ctx.registry.list() });
	});

	return app;
}
