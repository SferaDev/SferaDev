import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "../db/index.js";
import { accountSubscriptions, meters, organizations, plans, users } from "../db/schema.js";
import { env } from "../env.js";
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

export async function createOrganizationStripeCustomer(
	organizationId: string,
	name: string,
): Promise<string> {
	const customer = await stripe.customers.create({
		name,
		metadata: { platformOrganizationId: organizationId },
	});

	await db
		.update(organizations)
		.set({ stripeCustomerId: customer.id })
		.where(eq(organizations.id, organizationId));

	return customer.id;
}

/**
 * Resolves a Stripe customer ID for the given accountId.
 *
 * accountId may refer to either a user.id or organizations.id; we look up the
 * organization first (since products like photocall use the org as the billing
 * account), then fall back to user.
 */
async function getStripeCustomerId(accountId: string): Promise<string> {
	const [org] = await db
		.select({ stripeCustomerId: organizations.stripeCustomerId, name: organizations.name })
		.from(organizations)
		.where(eq(organizations.id, accountId))
		.limit(1);

	if (org) {
		if (org.stripeCustomerId) return org.stripeCustomerId;
		// Lazily provision a Stripe customer if missing (older orgs created
		// before the hook was wired up).
		return await createOrganizationStripeCustomer(accountId, org.name);
	}

	const [user] = await db
		.select({ stripeCustomerId: users.stripeCustomerId, email: users.email, name: users.name })
		.from(users)
		.where(eq(users.id, accountId))
		.limit(1);

	if (!user) {
		throw new Error(`No account found for id ${accountId}`);
	}

	if (user.stripeCustomerId) return user.stripeCustomerId;
	return await createStripeCustomer(accountId, user.email, user.name);
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

	const subscription = await stripe.subscriptions.create({
		customer: stripeCustomerId,
		items: [{ price: plan.stripePriceId, quantity: 1 }],
		metadata: {
			platformAccountId: params.accountId,
			platformProductId: params.productId,
			platformPlanId: params.planId,
		},
	});

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
			currentPeriodStart: getPeriodStart(subscription),
			currentPeriodEnd: getPeriodEnd(subscription),
		})
		.onConflictDoUpdate({
			target: [accountSubscriptions.accountId, accountSubscriptions.productId],
			set: {
				planId: params.planId,
				stripeSubscriptionId: subscription.id,
				status: subscription.status,
				currentPeriodStart: getPeriodStart(subscription),
				currentPeriodEnd: getPeriodEnd(subscription),
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

	if (existing.stripeSubscriptionId && newPlan.stripePriceId) {
		const stripeSub = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId);
		const firstItem = stripeSub.items.data[0];
		if (!firstItem) throw new Error("Subscription has no items");
		await stripe.subscriptions.update(existing.stripeSubscriptionId, {
			items: [{ id: firstItem.id, price: newPlan.stripePriceId }],
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

export async function getSubscription(
	accountId: string,
	productId: string,
): Promise<typeof accountSubscriptions.$inferSelect | null> {
	const [sub] = await db
		.select()
		.from(accountSubscriptions)
		.where(
			and(
				eq(accountSubscriptions.accountId, accountId),
				eq(accountSubscriptions.productId, productId),
			),
		)
		.limit(1);
	return sub ?? null;
}

export async function createCheckoutSession(params: {
	accountId: string;
	productId: string;
	priceId?: string;
	planId?: string;
	quantity?: number;
	mode?: "payment" | "subscription";
	successUrl: string;
	cancelUrl: string;
	metadata?: Record<string, string>;
}): Promise<{ url: string }> {
	const stripeCustomerId = await getStripeCustomerId(params.accountId);

	let priceId: string | null = params.priceId ?? null;

	if (!priceId && params.planId) {
		const [plan] = await db.select().from(plans).where(eq(plans.id, params.planId)).limit(1);
		if (!plan?.stripePriceId) {
			throw new Error(`Plan ${params.planId} has no Stripe price configured`);
		}
		priceId = plan.stripePriceId;
	}

	if (!priceId) {
		throw new Error("Either priceId or planId is required");
	}

	const mode: "payment" | "subscription" = params.mode ?? "subscription";

	const session = await stripe.checkout.sessions.create({
		customer: stripeCustomerId,
		mode,
		line_items: [
			{
				price: priceId,
				quantity: params.quantity ?? 1,
			},
		],
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		metadata: {
			...(params.metadata ?? {}),
			platformAccountId: params.accountId,
			platformProductId: params.productId,
			...(params.planId ? { platformPlanId: params.planId } : {}),
		},
		...(mode === "subscription"
			? {
					subscription_data: {
						metadata: {
							platformAccountId: params.accountId,
							platformProductId: params.productId,
							...(params.planId ? { platformPlanId: params.planId } : {}),
						},
					},
				}
			: {}),
	});

	if (!session.url) {
		throw new Error("Stripe did not return a checkout URL");
	}

	return { url: session.url };
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

	return invoices.data
		.filter((inv): inv is Stripe.Invoice & { id: string } => typeof inv.id === "string")
		.map((inv) => ({
			id: inv.id,
			amount: inv.amount_due,
			currency: inv.currency,
			status: inv.status,
			created: new Date(inv.created * 1000),
		}));
}

export async function getPortalUrl(accountId: string, returnUrl?: string): Promise<string> {
	const stripeCustomerId = await getStripeCustomerId(accountId);

	const session = await stripe.billingPortal.sessions.create({
		customer: stripeCustomerId,
		return_url: returnUrl ?? env.BETTER_AUTH_URL,
	});

	return session.url;
}

function getPeriodStart(subscription: Stripe.Subscription): Date | undefined {
	const firstItem = subscription.items.data[0];
	return firstItem?.current_period_start
		? new Date(firstItem.current_period_start * 1000)
		: undefined;
}

function getPeriodEnd(subscription: Stripe.Subscription): Date | undefined {
	const firstItem = subscription.items.data[0];
	return firstItem?.current_period_end ? new Date(firstItem.current_period_end * 1000) : undefined;
}
