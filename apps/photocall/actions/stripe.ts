"use server";

import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { requireSession } from "@/lib/auth";
import { requireOrgMembership } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import {
	type BillingSummary,
	EVENT_PRICE_CENTS,
	type EventBillingSummary,
	INCLUDED_PHOTOS_PER_EVENT,
	OVERAGE_PRICE_CENTS,
	PLAN_LIMITS,
	type Subscription,
} from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getSiteUrl() {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function getOrganization(organizationId: string) {
	const [org] = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, organizationId));
	return org ?? null;
}

async function getOrCreateStripeCustomer(
	organizationId: string,
	existingCustomerId: string | null,
): Promise<string> {
	if (existingCustomerId) return existingCustomerId;

	const customer = await stripe.customers.create({
		metadata: { organizationId },
	});

	await db
		.update(schema.organizations)
		.set({
			stripeCustomerId: customer.id,
			updatedAt: new Date(),
		})
		.where(eq(schema.organizations.id, organizationId));

	return customer.id;
}

export async function purchaseEvent(organizationId: string): Promise<{ url: string | null }> {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	const org = await getOrganization(organizationId);
	if (!org) {
		throw new Error("Organization not found");
	}

	const customerId = await getOrCreateStripeCustomer(organizationId, org.stripeCustomerId);

	const checkoutSession = await stripe.checkout.sessions.create({
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
		success_url: `${getSiteUrl()}/dashboard/${org.slug}/billing?success=true`,
		cancel_url: `${getSiteUrl()}/dashboard/${org.slug}/billing?canceled=true`,
		metadata: {
			organizationId,
			type: "event_purchase",
		},
	});

	return { url: checkoutSession.url };
}

export async function payOverages(
	organizationId: string,
	eventId: string,
): Promise<{ url: string | null }> {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	const org = await getOrganization(organizationId);
	if (!org) {
		throw new Error("Organization not found");
	}

	const [event] = await db.select().from(schema.events).where(eq(schema.events.id, eventId));

	if (!event || event.organizationId !== organizationId) {
		throw new Error("Event not found");
	}

	const overagePhotos = Math.max(0, event.photoCount - INCLUDED_PHOTOS_PER_EVENT);
	if (overagePhotos === 0) {
		throw new Error("No overages to pay");
	}

	const customerId = await getOrCreateStripeCustomer(organizationId, org.stripeCustomerId);

	const checkoutSession = await stripe.checkout.sessions.create({
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
		success_url: `${getSiteUrl()}/dashboard/${org.slug}/billing?success=true`,
		cancel_url: `${getSiteUrl()}/dashboard/${org.slug}/billing?canceled=true`,
		metadata: {
			organizationId,
			eventId,
			type: "overage_payment",
			overagePhotos: overagePhotos.toString(),
		},
	});

	return { url: checkoutSession.url };
}

export async function createPortalSession(organizationId: string): Promise<{ url: string }> {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner"]);

	const org = await getOrganization(organizationId);
	if (!org?.stripeCustomerId) {
		throw new Error("No billing account found");
	}

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: org.stripeCustomerId,
		return_url: `${getSiteUrl()}/dashboard/${org.slug}/billing`,
	});

	return { url: portalSession.url };
}

export async function getSubscription(organizationId: string): Promise<Subscription | null> {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId);

	const org = await getOrganization(organizationId);
	if (!org) return null;

	return {
		tier: org.subscriptionTier as "free" | "paid",
		status: org.subscriptionStatus as Subscription["status"],
		limits: {
			maxEvents: org.maxEvents,
			maxPhotosPerEvent: org.maxPhotosPerEvent,
			maxStorageBytes: org.maxStorageBytes,
			maxTeamMembers: org.maxTeamMembers,
		},
		features: PLAN_LIMITS[org.subscriptionTier as "free" | "paid"].features,
	};
}

export async function getBillingSummary(organizationId: string): Promise<BillingSummary | null> {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId);

	const org = await getOrganization(organizationId);
	if (!org) return null;

	const events = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.organizationId, organizationId));

	const eventSummaries: EventBillingSummary[] = events.map((event) => {
		const overagePhotos = Math.max(0, event.photoCount - INCLUDED_PHOTOS_PER_EVENT);
		return {
			eventId: event.id,
			name: event.name,
			photoCount: event.photoCount,
			includedPhotos: INCLUDED_PHOTOS_PER_EVENT,
			overagePhotos,
			overageCost: overagePhotos * OVERAGE_PRICE_CENTS,
		};
	});

	const totalOverageCost = eventSummaries.reduce((sum, e) => sum + e.overageCost, 0);

	return {
		tier: org.subscriptionTier as "free" | "paid",
		eventCredits: org.maxEvents,
		eventsUsed: events.length,
		eventPrice: EVENT_PRICE_CENTS,
		includedPhotosPerEvent: INCLUDED_PHOTOS_PER_EVENT,
		overagePricePerPhoto: OVERAGE_PRICE_CENTS,
		events: eventSummaries,
		totalOverageCost,
	};
}
