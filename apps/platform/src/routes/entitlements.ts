import { Hono } from "hono";
import type { Auth } from "../auth.js";
import { requireAuth, resolveAccountId, type ServiceAuthVariables } from "../middleware/auth.js";
import { entitlements } from "../services/entitlements.js";

export function entitlementRoutes(auth: Auth) {
	const app = new Hono<{ Variables: ServiceAuthVariables }>();

	app.use("*", requireAuth(auth));

	// Binary feature check
	app.get("/can", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const productId = c.req.query("productId");
		const feature = c.req.query("feature");

		if (!accountId || !productId || !feature) {
			return c.json({ error: "accountId, productId, and feature are required" }, 400);
		}

		const allowed = await entitlements.can(accountId, productId, feature);
		return c.json({ allowed });
	});

	// Quota check
	app.get("/quota", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const productId = c.req.query("productId");
		const feature = c.req.query("feature");

		if (!accountId || !productId || !feature) {
			return c.json({ error: "accountId, productId, and feature are required" }, 400);
		}

		const quota = await entitlements.getQuota(accountId, productId, feature);
		return c.json(quota);
	});

	// All entitlements for an account+product
	app.get("/all", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const productId = c.req.query("productId");

		if (!accountId || !productId) {
			return c.json({ error: "accountId and productId are required" }, 400);
		}

		const all = await entitlements.getEntitlements(accountId, productId);
		return c.json(all);
	});

	return app;
}
