"use server";

import type { Invoice, Subscription } from "@sferadev/platform-sdk";
import { and, eq, isNull } from "drizzle-orm";
import { requireOrgMembership } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { getPlatformClient } from "@/lib/platform";

/**
 * Photocall-specific billing facade over the platform SDK. All Stripe state
 * lives on the platform — these actions just expose what the dashboard needs
 * with photocall-scoped membership checks.
 */

export interface EventPhotoSummary {
	eventId: string;
	name: string;
	photoCount: number;
}

export interface BillingOverview {
	subscription: Subscription | null;
	usage: {
		photosCaptured: number;
	};
	events: EventPhotoSummary[];
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function getSubscription(organizationId: string): Promise<Subscription | null> {
	await requireOrgMembership(organizationId);
	return getPlatformClient().getSubscription(organizationId);
}

export async function getInvoices(organizationId: string): Promise<Invoice[]> {
	await requireOrgMembership(organizationId, ["owner", "admin"]);
	return getPlatformClient().getInvoices(organizationId);
}

export async function getBillingOverview(organizationId: string): Promise<BillingOverview> {
	await requireOrgMembership(organizationId);
	const platform = getPlatformClient();

	const [subscription, usage] = await Promise.all([
		platform.getSubscription(organizationId),
		platform.getUsage(organizationId, "photos_captured").catch(() => ({
			used: 0,
			meter: "photos_captured",
		})),
	]);

	const events = await db
		.select({
			eventId: schema.events.id,
			name: schema.events.name,
			photoCount: schema.events.photoCount,
		})
		.from(schema.events)
		.where(and(eq(schema.events.organizationId, organizationId), isNull(schema.events.deletedAt)));

	return {
		subscription,
		usage: { photosCaptured: usage.used },
		events,
	};
}

export async function startCheckout(
	organizationId: string,
	planId: string,
): Promise<{ url: string }> {
	await requireOrgMembership(organizationId, ["owner", "admin"]);

	const org = await getPlatformClient().lookupOrganization(organizationId);
	const slug = org?.slug ?? organizationId;

	return getPlatformClient().createCheckoutSession(organizationId, {
		planId,
		successUrl: `${siteUrl()}/dashboard/${slug}/billing?success=true`,
		cancelUrl: `${siteUrl()}/dashboard/${slug}/billing?canceled=true`,
	});
}

export async function changePlan(organizationId: string, planId: string): Promise<Subscription> {
	await requireOrgMembership(organizationId, ["owner", "admin"]);
	return getPlatformClient().changePlan(organizationId, planId);
}

export async function cancelSubscription(organizationId: string): Promise<void> {
	await requireOrgMembership(organizationId, ["owner"]);
	await getPlatformClient().cancelSubscription(organizationId);
}

export async function getPortalUrl(organizationId: string): Promise<{ url: string }> {
	await requireOrgMembership(organizationId, ["owner", "admin"]);

	const org = await getPlatformClient().lookupOrganization(organizationId);
	const slug = org?.slug ?? organizationId;

	const url = await getPlatformClient().getPortalUrl(
		organizationId,
		`${siteUrl()}/dashboard/${slug}/billing`,
	);

	return { url };
}
