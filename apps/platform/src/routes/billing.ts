import { Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../auth.js";
import { requireAuth, resolveAccountId, type ServiceAuthVariables } from "../middleware/auth.js";
import {
	cancelSubscription,
	createCheckoutSession,
	createSubscription,
	getInvoices,
	getPortalUrl,
	getSubscription,
	getUsage,
	reportUsage,
	updateSubscription,
} from "../services/billing.js";

export function billingRoutes(auth: Auth) {
	const app = new Hono<{ Variables: ServiceAuthVariables }>();

	app.use("*", requireAuth(auth));

	// Create subscription
	app.post("/subscribe", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				accountId: z.string().optional(),
				productId: z.string(),
				planId: z.string(),
			})
			.parse(body);

		const accountId = parsed.accountId ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		const sub = await createSubscription({
			accountId,
			productId: parsed.productId,
			planId: parsed.planId,
		});

		return c.json(sub, 201);
	});

	// Update subscription (change plan)
	app.patch("/subscribe", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				accountId: z.string().optional(),
				productId: z.string(),
				newPlanId: z.string(),
			})
			.parse(body);

		const accountId = parsed.accountId ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		const sub = await updateSubscription({
			accountId,
			productId: parsed.productId,
			newPlanId: parsed.newPlanId,
		});

		return c.json(sub);
	});

	// Cancel subscription
	app.delete("/subscribe", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				accountId: z.string().optional(),
				productId: z.string(),
			})
			.parse(body);

		const accountId = parsed.accountId ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		await cancelSubscription(accountId, parsed.productId);
		return c.json({ ok: true });
	});

	// Get current subscription
	app.get("/subscription", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const productId = c.req.query("productId");

		if (!accountId || !productId) {
			return c.json({ error: "accountId and productId are required" }, 400);
		}

		const sub = await getSubscription(accountId, productId);
		return c.json(sub);
	});

	// Create Stripe Checkout session
	app.post("/checkout", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				accountId: z.string().optional(),
				productId: z.string(),
				priceId: z.string().optional(),
				planId: z.string().optional(),
				quantity: z.number().int().positive().optional(),
				mode: z.enum(["payment", "subscription"]).optional(),
				successUrl: z.string().url(),
				cancelUrl: z.string().url(),
				metadata: z.record(z.string(), z.string()).optional(),
			})
			.refine((data) => data.priceId || data.planId, {
				message: "Either priceId or planId is required",
			})
			.parse(body);

		const accountId = parsed.accountId ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		const result = await createCheckoutSession({
			accountId,
			productId: parsed.productId,
			priceId: parsed.priceId,
			planId: parsed.planId,
			quantity: parsed.quantity,
			mode: parsed.mode,
			successUrl: parsed.successUrl,
			cancelUrl: parsed.cancelUrl,
			metadata: parsed.metadata,
		});

		return c.json(result, 201);
	});

	// Report metered usage
	app.post("/usage", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				accountId: z.string().optional(),
				productId: z.string(),
				meter: z.string(),
				value: z.number().positive(),
			})
			.parse(body);

		const accountId = parsed.accountId ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		await reportUsage({
			accountId,
			productId: parsed.productId,
			meter: parsed.meter,
			value: parsed.value,
		});

		return c.json({ ok: true });
	});

	// Get usage summary
	app.get("/usage", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const productId = c.req.query("productId");
		const meter = c.req.query("meter");

		if (!accountId || !productId || !meter) {
			return c.json({ error: "accountId, productId, and meter are required" }, 400);
		}

		const usage = await getUsage(accountId, productId, meter);
		return c.json(usage);
	});

	// List invoices
	app.get("/invoices", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		const invoices = await getInvoices(accountId);
		return c.json(invoices);
	});

	// Get Stripe Customer Portal URL
	app.get("/portal-url", async (c) => {
		const accountId = c.req.query("accountId") ?? resolveAccountId(c);
		const returnUrl = c.req.query("returnUrl") ?? undefined;
		if (!accountId) return c.json({ error: "accountId required" }, 400);

		const url = await getPortalUrl(accountId, returnUrl);
		return c.json({ url });
	});

	return app;
}
