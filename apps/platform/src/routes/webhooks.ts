import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type Stripe from "stripe";
import { db } from "../db/index.js";
import { accountSubscriptions, organizations, users } from "../db/schema.js";
import { env } from "../env.js";
import { entitlements } from "../services/entitlements.js";
import { stripe } from "../stripe.js";

export function webhookRoutes() {
	const app = new Hono();

	app.post("/stripe", async (c) => {
		const body = await c.req.text();
		const signature = c.req.header("stripe-signature");

		if (!signature) {
			return c.json({ error: "Missing stripe-signature header" }, 400);
		}

		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
		} catch {
			return c.json({ error: "Invalid signature" }, 400);
		}

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object;
				await handleCheckoutCompleted(session);
				break;
			}

			case "customer.subscription.created":
			case "customer.subscription.updated": {
				await syncSubscription(event.data.object);
				break;
			}

			case "customer.subscription.deleted": {
				await handleSubscriptionDeleted(event.data.object);
				break;
			}

			case "invoice.payment_failed": {
				await handleInvoicePaymentFailed(event.data.object);
				break;
			}
		}

		return c.json({ received: true });
	});

	return app;
}

async function resolveAccountIdFromCustomer(customerId: string): Promise<string | null> {
	const [org] = await db
		.select({ id: organizations.id })
		.from(organizations)
		.where(eq(organizations.stripeCustomerId, customerId))
		.limit(1);
	if (org) return org.id;

	const [user] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.stripeCustomerId, customerId))
		.limit(1);
	return user?.id ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
	if (session.payment_status !== "paid" && session.status !== "complete") {
		return;
	}

	const subscriptionId =
		typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
	if (!subscriptionId) return;

	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	await syncSubscription(subscription);
}

async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
	const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

	const accountId =
		sub.metadata.platformAccountId ?? (await resolveAccountIdFromCustomer(customerId));
	const productId = sub.metadata.platformProductId;
	const planId = sub.metadata.platformPlanId;

	if (!accountId || !productId || !planId) return;

	const firstItem = sub.items.data[0];
	const periodStart = firstItem?.current_period_start;
	const periodEnd = firstItem?.current_period_end;

	await db
		.insert(accountSubscriptions)
		.values({
			id: crypto.randomUUID(),
			accountId,
			productId,
			planId,
			stripeSubscriptionId: sub.id,
			status: sub.status,
			currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
			currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
		})
		.onConflictDoUpdate({
			target: [accountSubscriptions.accountId, accountSubscriptions.productId],
			set: {
				planId,
				stripeSubscriptionId: sub.id,
				status: sub.status,
				...(periodStart ? { currentPeriodStart: new Date(periodStart * 1000) } : {}),
				...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
				updatedAt: new Date(),
			},
		});

	entitlements.invalidate(accountId, productId);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
	await db
		.update(accountSubscriptions)
		.set({ status: "canceled", updatedAt: new Date() })
		.where(eq(accountSubscriptions.stripeSubscriptionId, sub.id));

	const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
	const accountId =
		sub.metadata.platformAccountId ?? (await resolveAccountIdFromCustomer(customerId));
	const productId = sub.metadata.platformProductId;
	if (accountId && productId) {
		entitlements.invalidate(accountId, productId);
	}
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
	if (!invoice.billing_reason?.startsWith("subscription")) return;

	const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
	if (!customerId) return;

	const accountId = await resolveAccountIdFromCustomer(customerId);
	if (!accountId) return;

	const subs = await db
		.select()
		.from(accountSubscriptions)
		.where(eq(accountSubscriptions.accountId, accountId));

	for (const sub of subs) {
		await db
			.update(accountSubscriptions)
			.set({ status: "past_due", updatedAt: new Date() })
			.where(
				and(
					eq(accountSubscriptions.accountId, sub.accountId),
					eq(accountSubscriptions.productId, sub.productId),
				),
			);
		entitlements.invalidate(sub.accountId, sub.productId);
	}
}
