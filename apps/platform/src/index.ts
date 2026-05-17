import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { auth } from "./auth.js";
import { env } from "./env.js";
import { accountRoutes } from "./routes/accounts.js";
import { billingRoutes } from "./routes/billing.js";
import { entitlementRoutes } from "./routes/entitlements.js";
import { productRoutes } from "./routes/products.js";
import { webhookRoutes } from "./routes/webhooks.js";

const app = new Hono();

// ─── Global middleware ──────────────────────────────────────────────

app.use(logger());

app.use(
	"*",
	cors({
		origin: (origin) => origin, // reflect origin for cross-product SSO
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

// ─── Error handling ─────────────────────────────────────────────────

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	if (err instanceof ZodError) {
		return c.json({ error: "Validation error", details: err.flatten() }, 400);
	}
	console.error("Unhandled error:", err);
	return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

// ─── Auth routes (better-auth handler) ──────────────────────────────

app.on(["POST", "GET"], "/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

// ─── API routes ─────────────────────────────────────────────────────

app.route("/api/accounts", accountRoutes(auth));
app.route("/api/billing", billingRoutes(auth));
app.route("/api/entitlements", entitlementRoutes(auth));
app.route("/api/products", productRoutes(auth));
app.route("/api/webhooks", webhookRoutes());

// ─── Health check ───────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok" }));

// ─── Start server ───────────────────────────────────────────────────

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
	console.log(`Platform service running on http://localhost:${info.port}`);
});

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
