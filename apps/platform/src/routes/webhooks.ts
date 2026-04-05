import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type Stripe from "stripe";
import { db } from "../db/index.js";
import { accountSubscriptions } from "../db/schema.js";
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
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const sub = event.data.object as Stripe.Subscription;
				await syncSubscription(sub);
				break;
			}

			case "customer.subscription.deleted": {
				const sub = event.data.object as Stripe.Subscription;
				await handleSubscriptionDeleted(sub);
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				// In Stripe v20+, use billing_reason to identify subscription invoices
				// and look up the subscription via our platform metadata on the customer
				const customerId =
					typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

				if (customerId && invoice.billing_reason?.startsWith("subscription")) {
					// Find platform subscriptions for this customer
					const subs = await db
						.select()
						.from(accountSubscriptions)
						.where(eq(accountSubscriptions.stripeSubscriptionId, customerId));

					for (const sub of subs) {
						await db
							.update(accountSubscriptions)
							.set({ status: "past_due", updatedAt: new Date() })
							.where(eq(accountSubscriptions.id, sub.id));
						entitlements.invalidate(sub.accountId, sub.productId);
					}
				}
				break;
			}
		}

		return c.json({ received: true });
	});

	return app;
}

async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
	const accountId = sub.metadata.platformAccountId;
	const productId = sub.metadata.platformProductId;
	const planId = sub.metadata.platformPlanId;

	if (!accountId || !productId || !planId) return;

	// In Stripe v20+, current_period_start/end are on SubscriptionItem, not Subscription
	const firstItem = sub.items.data[0];
	const periodStart = firstItem?.current_period_start;
	const periodEnd = firstItem?.current_period_end;

	await db
		.update(accountSubscriptions)
		.set({
			status: sub.status,
			...(periodStart && {
				currentPeriodStart: new Date(periodStart * 1000),
			}),
			...(periodEnd && {
				currentPeriodEnd: new Date(periodEnd * 1000),
			}),
			updatedAt: new Date(),
		})
		.where(eq(accountSubscriptions.stripeSubscriptionId, sub.id));

	entitlements.invalidate(accountId, productId);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
	await db
		.update(accountSubscriptions)
		.set({ status: "canceled", updatedAt: new Date() })
		.where(eq(accountSubscriptions.stripeSubscriptionId, sub.id));

	const accountId = sub.metadata.platformAccountId;
	const productId = sub.metadata.platformProductId;
	if (accountId) {
		entitlements.invalidate(accountId, productId);
	}
}
