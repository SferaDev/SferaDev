import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { BridgeContext } from "./context.js";

/** Body accepted by `POST /api/printers` (the manual-printer fallback). */
const addPrinterSchema = z.object({
	/** Full IPP(S) URI or a bare host/IP (e.g. `ipp://192.168.1.50:631/ipp/print`). */
	uri: z.string().min(1),
	/** Optional friendly name; defaults to the host when omitted. */
	name: z.string().min(1).optional(),
});

/** Printer discovery + live status endpoints. */
export function printerRoutes(ctx: BridgeContext): Hono {
	const app = new Hono();

	// List all discovered printers, refreshing their live state first.
	app.get("/", async (c) => {
		await ctx.registry.refreshAll();
		return c.json(ctx.registry.list());
	});

	// Manually add a printer by URI/IP (the fallback for when mDNS discovery is
	// unavailable). Fetches the printer's IPP attributes and upserts it.
	app.post("/", async (c) => {
		const body = await c.req.json();
		const { uri, name } = addPrinterSchema.parse(body);
		let printer: Awaited<ReturnType<typeof ctx.registry.addByUri>>;
		try {
			printer = await ctx.registry.addByUri(uri, name);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Could not add printer";
			throw new HTTPException(400, { message });
		}
		return c.json(printer, 201);
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
