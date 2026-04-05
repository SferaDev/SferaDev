import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { accountSubscriptions, meters, plans, users } from "../db/schema.js";
import { stripe } from "../stripe.js";
import { entitlements } from "./entitlements.js";

export async function createStripeCustomer(
	userId: string,
	email: string,
	name: string,
): Promise<string> {
	const customer = await stripe.customers.create({
		email,
		name,
		metadata: { platformUserId: userId },
	});

	await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));

	return customer.id;
}

async function getStripeCustomerId(accountId: string): Promise<string> {
	const [user] = await db
		.select({ stripeCustomerId: users.stripeCustomerId })
		.from(users)
		.where(eq(users.id, accountId))
		.limit(1);

	if (!user?.stripeCustomerId) {
		throw new Error(`No Stripe customer found for account ${accountId}`);
	}

	return user.stripeCustomerId;
}

export async function createSubscription(params: {
	accountId: string;
	productId: string;
	planId: string;
}): Promise<typeof accountSubscriptions.$inferSelect> {
	const stripeCustomerId = await getStripeCustomerId(params.accountId);

	const [plan] = await db.select().from(plans).where(eq(plans.id, params.planId)).limit(1);

	if (!plan) throw new Error(`Plan ${params.planId} not found`);

	// If the plan has no Stripe price (free tier), create a local-only subscription
	if (!plan.stripePriceId) {
		const id = crypto.randomUUID();
		const [sub] = await db
			.insert(accountSubscriptions)
			.values({
				id,
				accountId: params.accountId,
				productId: params.productId,
				planId: params.planId,
				status: "active",
				currentPeriodStart: new Date(),
			})
			.onConflictDoUpdate({
				target: [accountSubscriptions.accountId, accountSubscriptions.productId],
				set: {
					planId: params.planId,
					status: "active",
					updatedAt: new Date(),
				},
			})
			.returning();

		entitlements.invalidate(params.accountId, params.productId);
		return sub;
	}

	// Collect metered prices for this product
	const productMeters = await db
		.select()
		.from(meters)
		.where(eq(meters.productId, params.productId));

	const lineItems: Array<{ price: string; quantity?: number }> = [
		{ price: plan.stripePriceId, quantity: 1 },
	];

	// Add metered prices (no quantity — usage-based)
	for (const meter of productMeters) {
		if (meter.stripeMeterId) {
			// Metered prices are attached to the Stripe Product; we just need the price ID
			// The caller should have set these up in Stripe already
		}
	}

	const subscription = await stripe.subscriptions.create({
		customer: stripeCustomerId,
		items: lineItems,
		metadata: {
			platformAccountId: params.accountId,
			platformProductId: params.productId,
			platformPlanId: params.planId,
		},
	});

	// In Stripe v20+, current_period_start/end are on SubscriptionItem
	const firstItem = subscription.items.data[0];
	const periodStart = firstItem?.current_period_start
		? new Date(firstItem.current_period_start * 1000)
		: undefined;
	const periodEnd = firstItem?.current_period_end
		? new Date(firstItem.current_period_end * 1000)
		: undefined;

	const id = crypto.randomUUID();
	const [sub] = await db
		.insert(accountSubscriptions)
		.values({
			id,
			accountId: params.accountId,
			productId: params.productId,
			planId: params.planId,
			stripeSubscriptionId: subscription.id,
			status: subscription.status,
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
		})
		.onConflictDoUpdate({
			target: [accountSubscriptions.accountId, accountSubscriptions.productId],
			set: {
				planId: params.planId,
				stripeSubscriptionId: subscription.id,
				status: subscription.status,
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
				updatedAt: new Date(),
			},
		})
		.returning();

	entitlements.invalidate(params.accountId, params.productId);
	return sub;
}

export async function updateSubscription(params: {
	accountId: string;
	productId: string;
	newPlanId: string;
}): Promise<typeof accountSubscriptions.$inferSelect> {
	const [existing] = await db
		.select()
		.from(accountSubscriptions)
		.where(
			and(
				eq(accountSubscriptions.accountId, params.accountId),
				eq(accountSubscriptions.productId, params.productId),
			),
		)
		.limit(1);

	if (!existing) throw new Error("No existing subscription found");

	const [newPlan] = await db.select().from(plans).where(eq(plans.id, params.newPlanId)).limit(1);

	if (!newPlan) throw new Error(`Plan ${params.newPlanId} not found`);

	// Update Stripe subscription if it exists
	if (existing.stripeSubscriptionId && newPlan.stripePriceId) {
		const stripeSub = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId);
		await stripe.subscriptions.update(existing.stripeSubscriptionId, {
			items: [
				{
					id: stripeSub.items.data[0].id,
					price: newPlan.stripePriceId,
				},
			],
			metadata: { platformPlanId: params.newPlanId },
			proration_behavior: "create_prorations",
		});
	}

	const [updated] = await db
		.update(accountSubscriptions)
		.set({ planId: params.newPlanId, updatedAt: new Date() })
		.where(eq(accountSubscriptions.id, existing.id))
		.returning();

	entitlements.invalidate(params.accountId, params.productId);
	return updated;
}

export async function cancelSubscription(accountId: string, productId: string): Promise<void> {
	const [existing] = await db
		.select()
		.from(accountSubscriptions)
		.where(
			and(
				eq(accountSubscriptions.accountId, accountId),
				eq(accountSubscriptions.productId, productId),
			),
		)
		.limit(1);

	if (!existing) throw new Error("No existing subscription found");

	if (existing.stripeSubscriptionId) {
		await stripe.subscriptions.update(existing.stripeSubscriptionId, {
			cancel_at_period_end: true,
		});
	}

	await db
		.update(accountSubscriptions)
		.set({ status: "canceled", updatedAt: new Date() })
		.where(eq(accountSubscriptions.id, existing.id));

	entitlements.invalidate(accountId, productId);
}

export async function reportUsage(params: {
	accountId: string;
	productId: string;
	meter: string;
	value: number;
}): Promise<void> {
	const stripeCustomerId = await getStripeCustomerId(params.accountId);

	const [meterRecord] = await db
		.select()
		.from(meters)
		.where(and(eq(meters.productId, params.productId), eq(meters.name, params.meter)))
		.limit(1);

	if (!meterRecord?.stripeMeterEventName) {
		throw new Error(`Meter "${params.meter}" not found for product ${params.productId}`);
	}

	await stripe.billing.meterEvents.create({
		event_name: meterRecord.stripeMeterEventName,
		payload: {
			stripe_customer_id: stripeCustomerId,
			value: String(params.value),
		},
	});
}

export async function getUsage(
	accountId: string,
	productId: string,
	meter: string,
): Promise<{ used: number; meter: string }> {
	const stripeCustomerId = await getStripeCustomerId(accountId);

	const [meterRecord] = await db
		.select()
		.from(meters)
		.where(and(eq(meters.productId, productId), eq(meters.name, meter)))
		.limit(1);

	if (!meterRecord?.stripeMeterId) {
		throw new Error(`Meter "${meter}" not found for product ${productId}`);
	}

	const summary = await stripe.billing.meters.listEventSummaries(meterRecord.stripeMeterId, {
		customer: stripeCustomerId,
		start_time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // last 30 days
		end_time: Math.floor(Date.now() / 1000),
	});

	const totalUsage = summary.data.reduce((sum, s) => sum + s.aggregated_value, 0);

	return { used: totalUsage, meter };
}

export async function getInvoices(
	accountId: string,
): Promise<
	Array<{ id: string; amount: number; currency: string; status: string | null; created: Date }>
> {
	const stripeCustomerId = await getStripeCustomerId(accountId);

	const invoices = await stripe.invoices.list({
		customer: stripeCustomerId,
		limit: 20,
	});

	return invoices.data.map((inv) => ({
		id: inv.id,
		amount: inv.amount_due,
		currency: inv.currency,
		status: inv.status,
		created: new Date(inv.created * 1000),
	}));
}

export async function getPortalUrl(accountId: string): Promise<string> {
	const stripeCustomerId = await getStripeCustomerId(accountId);

	const session = await stripe.billingPortal.sessions.create({
		customer: stripeCustomerId,
		return_url: process.env.BETTER_AUTH_URL,
	});

	return session.url;
}
