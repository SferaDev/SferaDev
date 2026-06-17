import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import QRCode from "qrcode";
import { ZodError } from "zod";
import { env } from "./env.js";
import { MdnsManager } from "./mdns.js";
import { PrinterRegistry } from "./printer-registry.js";
import { PrintQueue } from "./queue.js";
import type { BridgeContext } from "./routes/context.js";
import { healthRoutes } from "./routes/health.js";
import { jobRoutes } from "./routes/jobs.js";
import { printerRoutes } from "./routes/printers.js";

// ─── Wire up the bridge services ────────────────────────────────────
const registry = new PrinterRegistry(env.BRIDGE_IPP_VERSION);
const queue = new PrintQueue(registry, env.BRIDGE_IPP_VERSION);
const mdns = new MdnsManager(registry, env.BRIDGE_USE_TLS);
const ctx: BridgeContext = { registry, queue, mdns, startedAt: Date.now() };

const app = new Hono();

// ─── Global middleware ──────────────────────────────────────────────
app.use(logger());

const allowedOrigins =
	env.BRIDGE_ALLOWED_ORIGINS === "*"
		? null
		: env.BRIDGE_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

app.use(
	"*",
	cors({
		// Reflect any origin when `*`, otherwise enforce the allowlist.
		origin: (origin) =>
			allowedOrigins ? (allowedOrigins.includes(origin) ? origin : null) : origin,
		allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
		allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
	}),
);

// ─── Optional API key on /api/* ─────────────────────────────────────
if (env.BRIDGE_API_KEY) {
	const apiKey = env.BRIDGE_API_KEY;
	app.use("/api/*", async (c, next) => {
		const bearer = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
		const provided = bearer ?? c.req.header("x-api-key");
		if (provided !== apiKey) {
			throw new HTTPException(401, { message: "Invalid API key" });
		}
		await next();
	});
}

// ─── Error handling ─────────────────────────────────────────────────
app.onError((err, c) => {
	if (err instanceof HTTPException) return err.getResponse();
	if (err instanceof ZodError) {
		return c.json({ error: "Validation error", details: err.flatten() }, 400);
	}
	console.error("Unhandled error:", err);
	return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

// ─── Routes ─────────────────────────────────────────────────────────
app.route("/health", healthRoutes(ctx));
app.route("/api/printers", printerRoutes(ctx));
app.route("/api/jobs", jobRoutes(ctx));

// Combined bridge + printers snapshot.
app.get("/api/status", (c) =>
	c.json({
		bridge: {
			status: "ok",
			uptime: Math.floor((Date.now() - ctx.startedAt) / 1000),
			ippVersion: env.BRIDGE_IPP_VERSION,
			jobsPending: queue.countPending(),
			jobsFailed: queue.countFailed(),
		},
		printers: registry.list(),
	}),
);

// QR code of the bridge's own URL, for easy operator pairing from a phone.
app.get("/qr", async (c) => {
	const host = c.req.header("host") ?? `localhost:${env.PORT}`;
	const scheme = c.req.header("x-forwarded-proto") ?? "http";
	const url = `${scheme}://${host}`;
	const png = await QRCode.toBuffer(url, { type: "png", width: 320, margin: 2 });
	// Copy into a plain ArrayBuffer-backed Uint8Array for Hono's body type.
	const body = new Uint8Array(png);
	return c.body(body, 200, { "Content-Type": "image/png" });
});

// ─── Startup ────────────────────────────────────────────────────────
// Seed manually-configured printers first (the mDNS-independent fallback) so
// the bridge is usable even when discovery is unavailable.
if (env.BRIDGE_PRINTER_URIS) {
	registry.seedFromUris(env.BRIDGE_PRINTER_URIS);
}

// mDNS multicast (node:dgram) can be flaky under Bun's Node compatibility
// layer, so guard advertise/discovery: a failure here must not take down the
// HTTP server or the manual-printer fallback.
try {
	mdns.advertise(env.PORT);
	mdns.startDiscovery();
} catch (error) {
	console.warn(
		"[mdns] discovery/advertising unavailable — relying on manual printers (BRIDGE_PRINTER_URIS / POST /api/printers):",
		error instanceof Error ? error.message : error,
	);
}

registry.startAutoRefresh();

// ─── Bun server ─────────────────────────────────────────────────────
const server = Bun.serve({ fetch: app.fetch, port: env.PORT });
console.log(`Photocall print bridge running on http://localhost:${server.port}`);
console.log("Discovering IPP printers over mDNS…");

function shutdown(): void {
	console.log("Shutting down print bridge…");
	registry.stopAutoRefresh();
	mdns.destroy();
	void server.stop();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
