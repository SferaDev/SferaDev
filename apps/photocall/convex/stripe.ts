import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { requireAuth, requireOrgMembership } from "./lib/auth";
import {
	EVENT_PRICE_CENTS,
	INCLUDED_PHOTOS_PER_EVENT,
	OVERAGE_PRICE_CENTS,
	PLAN_LIMITS,
} from "./lib/plans";
import type { BillingSummary, EventBillingSummary, Subscription } from "./lib/types";

// Get Stripe instance (server-side only)
async function getStripe() {
	const Stripe = (await import("stripe")).default;
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		throw new Error("STRIPE_SECRET_KEY not configured");
	}
	return new Stripe(apiKey);
}

// Purchase a new event credit
export const purchaseEvent = action({
	args: {
		organizationId: v.id("organizations"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx as any);
		await requireOrgMembership(ctx as any, userId, args.organizationId, ["owner", "admin"]);

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

		// Create checkout session for one-time event purchase
		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: "Event Credit",
							description: `Includes ${INCLUDED_PHOTOS_PER_EVENT} photos. Additional photos $${(OVERAGE_PRICE_CENTS / 100).toFixed(2)} each.`,
						},
						unit_amount: EVENT_PRICE_CENTS,
					},
					quantity: 1,
				},
			],
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/billing?success=true`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/billing?canceled=true`,
			metadata: {
				organizationId: args.organizationId,
				type: "event_purchase",
			},
		});

		return { url: session.url };
	},
});

// Create checkout for photo overages
export const payOverages = action({
	args: {
		organizationId: v.id("organizations"),
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx as any);
		await requireOrgMembership(ctx as any, userId, args.organizationId, ["owner", "admin"]);

		const org = await ctx.runQuery(internal.stripe.getOrganization, {
			organizationId: args.organizationId,
		});

		if (!org) {
			throw new Error("Organization not found");
		}

		const event = await ctx.runQuery(internal.stripe.getEvent, {
			eventId: args.eventId,
		});

		if (!event || event.organizationId !== args.organizationId) {
			throw new Error("Event not found");
		}

		const overagePhotos = Math.max(0, event.photoCount - INCLUDED_PHOTOS_PER_EVENT);
		if (overagePhotos === 0) {
			throw new Error("No overages to pay");
		}

		const stripe = await getStripe();

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

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: `Photo Overages - ${event.name}`,
							description: `${overagePhotos} photos over the ${INCLUDED_PHOTOS_PER_EVENT} included`,
						},
						unit_amount: OVERAGE_PRICE_CENTS,
					},
					quantity: overagePhotos,
				},
			],
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/billing?success=true`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/billing?canceled=true`,
			metadata: {
				organizationId: args.organizationId,
				eventId: args.eventId,
				type: "overage_payment",
				overagePhotos: overagePhotos.toString(),
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
			return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${org.slug}/billing`,
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

// Internal query to get event (used by actions)
export const getEvent = query({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.eventId);
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

// Webhook handler for successful payment (event purchase or overage)
export const handlePaymentSuccess = internalMutation({
	args: {
		stripeEventId: v.string(),
		stripeCustomerId: v.string(),
		type: v.string(),
		organizationId: v.string(),
		eventId: v.optional(v.string()),
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
			type: args.type,
			processedAt: Date.now(),
		});

		const org = await ctx.db
			.query("organizations")
			.withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
			.unique();

		if (!org) {
			console.error("Organization not found for Stripe customer:", args.stripeCustomerId);
			return;
		}

		if (args.type === "event_purchase") {
			// Upgrade to paid tier and add event credit
			const paidLimits = PLAN_LIMITS.paid;
			await ctx.db.patch(org._id, {
				subscriptionTier: "paid",
				subscriptionStatus: "active",
				maxEvents: org.maxEvents + 1,
				maxPhotosPerEvent: paidLimits.maxPhotosPerEvent,
				maxStorageBytes: paidLimits.maxStorageBytes,
				maxTeamMembers: paidLimits.maxTeamMembers,
				updatedAt: Date.now(),
			});
		}
		// Overage payments don't change org state - they just settle the balance
	},
});

export const getSubscription = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args): Promise<Subscription | null> => {
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

// Get billing summary for an organization
export const getBillingSummary = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args): Promise<BillingSummary | null> => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId);

		const org = await ctx.db.get(args.organizationId);
		if (!org) return null;

		// Get all events and calculate overages
		const events = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		const eventSummaries: EventBillingSummary[] = events.map((event) => {
			const overagePhotos = Math.max(0, event.photoCount - INCLUDED_PHOTOS_PER_EVENT);
			return {
				eventId: event._id,
				name: event.name,
				photoCount: event.photoCount,
				includedPhotos: INCLUDED_PHOTOS_PER_EVENT,
				overagePhotos,
				overageCost: overagePhotos * OVERAGE_PRICE_CENTS,
			};
		});

		const totalOverageCost = eventSummaries.reduce((sum, e) => sum + e.overageCost, 0);

		return {
			tier: org.subscriptionTier,
			eventCredits: org.maxEvents,
			eventsUsed: events.length,
			eventPrice: EVENT_PRICE_CENTS,
			includedPhotosPerEvent: INCLUDED_PHOTOS_PER_EVENT,
			overagePricePerPhoto: OVERAGE_PRICE_CENTS,
			events: eventSummaries,
			totalOverageCost,
		};
	},
});
