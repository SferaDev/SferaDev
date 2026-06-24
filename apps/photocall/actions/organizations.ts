"use server";

import type { Invitation, Member, Organization, OrganizationRole } from "@sferadev/platform-sdk";
import { and, eq, isNull, sql } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { generateSlug, requireOrgMembership, requireSession } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { getPlatformClient } from "@/lib/platform";
import { deleteFile, getFileUrl } from "@/lib/storage";

export interface OrganizationWithLogo extends Organization {
	logoUrl: string | null;
	role?: OrganizationRole | string;
}

async function withLogoUrl(org: Organization, role?: string): Promise<OrganizationWithLogo> {
	const [settings] = await db
		.select()
		.from(schema.orgSettings)
		.where(eq(schema.orgSettings.organizationId, org.id))
		.limit(1);
	const key = settings?.logoStorageKey ?? null;
	const logoUrl = key ? await getFileUrl(key) : null;
	return { ...org, logoUrl, role };
}

export async function getOrganizations(): Promise<OrganizationWithLogo[]> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireSession();

	const organizations = await platform.listOrganizations(headers);
	// Compute role per org by checking membership. listOrganizations doesn't
	// include role, so we look it up via listMembers (one query per org).
	const account = (await platform.verifySession(headers))!;
	const enriched = await Promise.all(
		organizations.map(async (org) => {
			const members = await platform.listMembers(org.id, headers);
			const me = members.find((m) => m.userId === account.id);
			return withLogoUrl(org, me?.role);
		}),
	);
	return enriched;
}

export async function createOrganization(name: string): Promise<string> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireSession();

	const baseSlug = generateSlug(name);
	const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

	const org = await platform.createOrganization({ name, slug }, headers);

	// Create the photocall-specific settings row.
	await db.insert(schema.orgSettings).values({ organizationId: org.id }).onConflictDoNothing();

	return org.id;
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationWithLogo | null> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireSession();

	const org = await platform.getOrganization(slug, headers);
	if (!org) return null;
	return withLogoUrl(org);
}

export async function updateOrganization(
	id: string,
	data: { name?: string; logoStorageKey?: string },
): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(id, ["owner", "admin"]);

	if (data.name !== undefined) {
		await platform.updateOrganization(id, { name: data.name }, headers);
	}

	if (data.logoStorageKey !== undefined) {
		await db
			.insert(schema.orgSettings)
			.values({
				organizationId: id,
				logoStorageKey: data.logoStorageKey,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: schema.orgSettings.organizationId,
				set: { logoStorageKey: data.logoStorageKey, updatedAt: new Date() },
			});
	}
}

export async function deleteOrganization(id: string): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(id, ["owner"]);

	// Tear down photocall-owned data first.
	const events = await db.select().from(schema.events).where(eq(schema.events.organizationId, id));

	for (const event of events) {
		const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, event.id));
		for (const photo of photos) await deleteFile(photo.storageKey);
		await db.delete(schema.photos).where(eq(schema.photos.eventId, event.id));

		const templates = await db
			.select()
			.from(schema.templates)
			.where(eq(schema.templates.eventId, event.id));
		for (const template of templates) {
			await deleteFile(template.storageKey);
			if (template.thumbnailStorageKey) await deleteFile(template.thumbnailStorageKey);
		}
		await db.delete(schema.templates).where(eq(schema.templates.eventId, event.id));
		await db.delete(schema.kioskSessions).where(eq(schema.kioskSessions.eventId, event.id));
	}

	await db.delete(schema.events).where(eq(schema.events.organizationId, id));
	await db.delete(schema.usageLogs).where(eq(schema.usageLogs.organizationId, id));
	await db.delete(schema.orgSettings).where(eq(schema.orgSettings.organizationId, id));

	// Then ask the platform to delete the org itself.
	await platform.deleteOrganization(id, headers);
}

export async function getMembers(organizationId: string): Promise<Member[]> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId);
	return platform.listMembers(organizationId, headers);
}

export async function updateMemberRole(
	organizationId: string,
	memberId: string,
	role: "admin" | "member",
): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId, ["owner"]);
	await platform.updateMemberRole(organizationId, memberId, role, headers);
}

export async function removeMember(organizationId: string, memberId: string): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId, ["owner", "admin"]);
	await platform.removeMember(organizationId, memberId, headers);
}

export async function inviteMember(
	organizationId: string,
	email: string,
	role: "admin" | "member",
): Promise<Invitation> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId, ["owner", "admin"]);

	const allowed = await platform.can(organizationId, "invite_member");
	if (!allowed) {
		throw new Error("Team member limit reached. Upgrade your plan to add more members.");
	}

	return platform.inviteMember(organizationId, { email: email.toLowerCase(), role }, headers);
}

export async function getInvitations(organizationId: string): Promise<Invitation[]> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId, ["owner", "admin"]);
	return platform.listInvitations(organizationId, headers);
}

export async function cancelInvitation(invitationId: string): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await platform.cancelInvitation(invitationId, headers);
}

export async function acceptInvitation(invitationId: string): Promise<{ organizationId: string }> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	return platform.acceptInvitation(invitationId, headers);
}

export async function rejectInvitation(invitationId: string): Promise<void> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await platform.rejectInvitation(invitationId, headers);
}

export async function getInvitation(
	invitationId: string,
): Promise<(Invitation & { organizationName: string | null }) | null> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();

	const invitation = await platform.getInvitation(invitationId, headers);
	if (!invitation) return null;

	const org = await platform.getOrganization(invitation.organizationId, headers);
	return { ...invitation, organizationName: org?.name ?? null };
}

export async function getUsage(organizationId: string) {
	const platform = getPlatformClient();
	const headers = await nextHeaders();
	await requireOrgMembership(organizationId);

	const eventQuota = await platform.getQuota(organizationId, "create_event");
	const photoQuota = await platform.getQuota(organizationId, "capture_photo");
	const storageQuota = await platform.getQuota(organizationId, "storage_bytes");
	const teamQuota = await platform.getQuota(organizationId, "invite_member");

	const events = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.organizationId, organizationId), isNull(schema.events.deletedAt)));

	const totalPhotos = events.reduce((sum, e) => sum + e.photoCount, 0);
	const totalSessions = events.reduce((sum, e) => sum + e.sessionCount, 0);
	// Storage usage reflects only live objects: skip soft-deleted photos and
	// photos under soft-deleted events (their R2 objects are purged by the cron).
	const totalStorageBytes = await db
		.select({ sum: sql<number>`coalesce(sum(${schema.photos.sizeBytes}), 0)` })
		.from(schema.photos)
		.innerJoin(schema.events, eq(schema.photos.eventId, schema.events.id))
		.where(
			and(
				eq(schema.events.organizationId, organizationId),
				isNull(schema.events.deletedAt),
				isNull(schema.photos.deletedAt),
			),
		)
		.then((rows) => Number(rows[0]?.sum ?? 0));

	const members = await platform.listMembers(organizationId, headers);

	return {
		events: {
			used: events.length,
			limit: eventQuota.limit ?? -1,
		},
		storage: {
			used: totalStorageBytes,
			limit: storageQuota.limit ?? -1,
		},
		teamMembers: {
			used: members.length,
			limit: teamQuota.limit ?? -1,
		},
		photos: totalPhotos,
		sessions: totalSessions,
		photoLimit: photoQuota.limit ?? -1,
	};
}
