import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { requireAuth, requireOrgMembership } from "./lib/auth";
import { PLAN_LIMITS, type SubscriptionTier } from "./lib/plans";

// Get Stripe instance (server-side only)
async function getStripe() {
	const Stripe = (await import("stripe")).default;
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		throw new Error("STRIPE_SECRET_KEY not configured");
	}
	return new Stripe(apiKey);
}

export const createCheckoutSession = action({
	args: {
		organizationId: v.id("organizations"),
		tier: v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
		billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx as any);
		await requireOrgMembership(ctx as any, userId, args.organizationId, ["owner"]);

		const org = await ctx.runQuery(internal.stripe.getOrganization, {
			organizationId: args.organizationId,
		});

		if (!org) {
			throw new Error("Organization not found");
		}

		const stripe = await getStripe();

		// Get or create Stripe customer
		let customerId = org.stripeCustomerId;
		if (!customerId) {
			const customer = await stripe.customers.create({
				metadata: {
					organizationId: args.organizationId,
				},
			});
			customerId = customer.id;

			await ctx.runMutation(internal.stripe.updateStripeCustomerId, {
				organizationId: args.organizationId,
				stripeCustomerId: customerId,
			});
		}

		// Get price ID based on tier and billing period
		const priceId = getPriceId(args.tier, args.billingPeriod);

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "subscription",
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/settings/billing?success=true`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/settings/billing?canceled=true`,
			subscription_data: {
				metadata: {
					organizationId: args.organizationId,
					tier: args.tier,
				},
			},
		});

		return { url: session.url };
	},
});

export const createPortalSession = action({
	args: {
		organizationId: v.id("organizations"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx as any);
		await requireOrgMembership(ctx as any, userId, args.organizationId, ["owner"]);

		const org = await ctx.runQuery(internal.stripe.getOrganization, {
			organizationId: args.organizationId,
		});

		if (!org?.stripeCustomerId) {
			throw new Error("No billing account found");
		}

		const stripe = await getStripe();

		const session = await stripe.billingPortal.sessions.create({
			customer: org.stripeCustomerId,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/settings/billing`,
		});

		return { url: session.url };
	},
});

// Internal query to get organization (used by actions)
export const getOrganization = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.organizationId);
	},
});

// Internal mutation to update Stripe customer ID
export const updateStripeCustomerId = internalMutation({
	args: {
		organizationId: v.id("organizations"),
		stripeCustomerId: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.organizationId, {
			stripeCustomerId: args.stripeCustomerId,
			updatedAt: Date.now(),
		});
	},
});

// Webhook handler for subscription updates
export const handleSubscriptionUpdated = internalMutation({
	args: {
		stripeEventId: v.string(),
		stripeSubscriptionId: v.string(),
		stripeCustomerId: v.string(),
		status: v.string(),
		tier: v.string(),
		currentPeriodEnd: v.number(),
	},
	handler: async (ctx, args) => {
		// Check idempotency
		const existingEvent = await ctx.db
			.query("stripeEvents")
			.withIndex("by_stripe_event", (q) => q.eq("stripeEventId", args.stripeEventId))
			.unique();

		if (existingEvent) {
			return; // Already processed
		}

		// Record event
		await ctx.db.insert("stripeEvents", {
			stripeEventId: args.stripeEventId,
			type: "subscription_updated",
			processedAt: Date.now(),
		});

		// Find organization by Stripe customer ID
		const org = await ctx.db
			.query("organizations")
			.withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
			.unique();

		if (!org) {
			console.error("Organization not found for Stripe customer:", args.stripeCustomerId);
			return;
		}

		const tier = args.tier as SubscriptionTier;
		const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.free;

		const subscriptionStatus = mapStripeStatus(args.status);

		await ctx.db.patch(org._id, {
			stripeSubscriptionId: args.stripeSubscriptionId,
			subscriptionTier: tier,
			subscriptionStatus,
			maxEvents: limits.maxEvents,
			maxPhotosPerEvent: limits.maxPhotosPerEvent,
			maxStorageBytes: limits.maxStorageBytes,
			maxTeamMembers: limits.maxTeamMembers,
			updatedAt: Date.now(),
		});
	},
});

// Webhook handler for subscription canceled
export const handleSubscriptionCanceled = internalMutation({
	args: {
		stripeEventId: v.string(),
		stripeSubscriptionId: v.string(),
		stripeCustomerId: v.string(),
	},
	handler: async (ctx, args) => {
		// Check idempotency
		const existingEvent = await ctx.db
			.query("stripeEvents")
			.withIndex("by_stripe_event", (q) => q.eq("stripeEventId", args.stripeEventId))
			.unique();

		if (existingEvent) {
			return;
		}

		await ctx.db.insert("stripeEvents", {
			stripeEventId: args.stripeEventId,
			type: "subscription_canceled",
			processedAt: Date.now(),
		});

		const org = await ctx.db
			.query("organizations")
			.withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
			.unique();

		if (!org) {
			return;
		}

		const freeLimits = PLAN_LIMITS.free;

		await ctx.db.patch(org._id, {
			subscriptionTier: "free",
			subscriptionStatus: "canceled",
			maxEvents: freeLimits.maxEvents,
			maxPhotosPerEvent: freeLimits.maxPhotosPerEvent,
			maxStorageBytes: freeLimits.maxStorageBytes,
			maxTeamMembers: freeLimits.maxTeamMembers,
			updatedAt: Date.now(),
		});
	},
});

export const getSubscription = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId);

		const org = await ctx.db.get(args.organizationId);
		if (!org) return null;

		return {
			tier: org.subscriptionTier,
			status: org.subscriptionStatus,
			limits: {
				maxEvents: org.maxEvents,
				maxPhotosPerEvent: org.maxPhotosPerEvent,
				maxStorageBytes: org.maxStorageBytes,
				maxTeamMembers: org.maxTeamMembers,
			},
			features: PLAN_LIMITS[org.subscriptionTier].features,
		};
	},
});

// Helper functions
function getPriceId(
	tier: "starter" | "pro" | "enterprise",
	billingPeriod: "monthly" | "yearly",
): string {
	const prices: Record<string, Record<string, string>> = {
		starter: {
			monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "price_starter_monthly",
			yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID ?? "price_starter_yearly",
		},
		pro: {
			monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_pro_monthly",
			yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "price_pro_yearly",
		},
		enterprise: {
			monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? "price_enterprise_monthly",
			yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID ?? "price_enterprise_yearly",
		},
	};

	return prices[tier][billingPeriod];
}

function mapStripeStatus(status: string): "active" | "past_due" | "canceled" | "trialing" | "none" {
	switch (status) {
		case "active":
			return "active";
		case "past_due":
			return "past_due";
		case "canceled":
		case "unpaid":
			return "canceled";
		case "trialing":
			return "trialing";
		default:
			return "none";
	}
}
