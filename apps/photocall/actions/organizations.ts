"use server";

import { and, eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { generateSlug, generateToken, requireOrgMembership } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function getOrganizations() {
	const session = await requireSession();
	const userId = session.user.id;

	const memberships = await db
		.select()
		.from(schema.organizationMembers)
		.where(eq(schema.organizationMembers.userId, userId));

	const orgs = await Promise.all(
		memberships.map(async (m) => {
			const org = await db
				.select()
				.from(schema.organizations)
				.where(eq(schema.organizations.id, m.organizationId))
				.then((rows) => rows[0]);

			if (!org) return null;

			const logoUrl = org.logoStorageKey ? await getFileUrl(org.logoStorageKey) : null;
			return {
				...org,
				logoUrl,
				role: m.role,
			};
		}),
	);

	return orgs.filter((org): org is NonNullable<typeof org> => org !== null);
}

export async function createOrganization(name: string) {
	const session = await requireSession();
	const userId = session.user.id;

	// Check if user already owns an organization (free tier limit)
	const ownedOrgs = await db
		.select({ id: schema.organizations.id })
		.from(schema.organizations)
		.where(eq(schema.organizations.ownerId, userId));

	if (ownedOrgs.length >= 1) {
		throw new Error("You can only own one organization on the free tier");
	}

	// Generate unique slug
	const baseSlug = generateSlug(name);
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existing = await db
			.select({ id: schema.organizations.id })
			.from(schema.organizations)
			.where(eq(schema.organizations.slug, slug))
			.then((rows) => rows[0]);
		if (!existing) break;
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	const now = new Date();
	const freeLimits = PLAN_LIMITS.free;

	const [org] = await db
		.insert(schema.organizations)
		.values({
			name,
			slug,
			ownerId: userId,
			subscriptionTier: "free",
			subscriptionStatus: "none",
			maxEvents: freeLimits.maxEvents,
			maxPhotosPerEvent: freeLimits.maxPhotosPerEvent,
			maxStorageBytes: freeLimits.maxStorageBytes,
			maxTeamMembers: freeLimits.maxTeamMembers,
			currentStorageBytes: 0,
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: schema.organizations.id });

	// Add owner as member
	await db.insert(schema.organizationMembers).values({
		organizationId: org.id,
		userId,
		role: "owner",
		joinedAt: now,
	});

	return org.id;
}

export async function getOrganization(id: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, id);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, id))
		.then((rows) => rows[0]);

	if (!org) return null;

	const logoUrl = org.logoStorageKey ? await getFileUrl(org.logoStorageKey) : null;

	return {
		...org,
		logoUrl,
	};
}

export async function getOrganizationBySlug(slug: string) {
	const session = await requireSession();

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.slug, slug))
		.then((rows) => rows[0]);

	if (!org) return null;

	await requireOrgMembership(session.user.id, org.id);

	const logoUrl = org.logoStorageKey ? await getFileUrl(org.logoStorageKey) : null;

	return {
		...org,
		logoUrl,
	};
}

export async function updateOrganization(
	id: string,
	data: { name?: string; logoStorageKey?: string },
) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, id, ["owner", "admin"]);

	await db
		.update(schema.organizations)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(schema.organizations.id, id));
}

export async function deleteOrganization(id: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, id, ["owner"]);

	// Delete all related data
	const events = await db.select().from(schema.events).where(eq(schema.events.organizationId, id));

	for (const event of events) {
		// Delete photos and their storage files
		const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, event.id));

		for (const photo of photos) {
			await deleteFile(photo.storageKey);
		}
		await db.delete(schema.photos).where(eq(schema.photos.eventId, event.id));

		// Delete templates and their storage files
		const templates = await db
			.select()
			.from(schema.templates)
			.where(eq(schema.templates.eventId, event.id));

		for (const template of templates) {
			await deleteFile(template.storageKey);
			if (template.thumbnailStorageKey) {
				await deleteFile(template.thumbnailStorageKey);
			}
		}
		await db.delete(schema.templates).where(eq(schema.templates.eventId, event.id));

		// Delete sessions
		await db.delete(schema.kioskSessions).where(eq(schema.kioskSessions.eventId, event.id));
	}

	// Delete events
	await db.delete(schema.events).where(eq(schema.events.organizationId, id));

	// Delete memberships
	await db
		.delete(schema.organizationMembers)
		.where(eq(schema.organizationMembers.organizationId, id));

	// Delete invitations
	await db.delete(schema.invitations).where(eq(schema.invitations.organizationId, id));

	// Delete usage logs
	await db.delete(schema.usageLogs).where(eq(schema.usageLogs.organizationId, id));

	// Delete the organization
	await db.delete(schema.organizations).where(eq(schema.organizations.id, id));
}

export async function getMembers(organizationId: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId);

	const memberships = await db
		.select()
		.from(schema.organizationMembers)
		.where(eq(schema.organizationMembers.organizationId, organizationId));

	const members = await Promise.all(
		memberships.map(async (m) => {
			const userRow = await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, m.userId))
				.then((rows) => rows[0]);

			const profile = await db
				.select()
				.from(schema.userProfiles)
				.where(eq(schema.userProfiles.userId, m.userId))
				.then((rows) => rows[0]);

			return {
				...m,
				user: userRow ?? null,
				profile: profile ?? null,
			};
		}),
	);

	return members;
}

export async function updateMemberRole(
	organizationId: string,
	userId: string,
	role: "admin" | "member",
) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner"]);

	const membership = await db
		.select()
		.from(schema.organizationMembers)
		.where(
			and(
				eq(schema.organizationMembers.organizationId, organizationId),
				eq(schema.organizationMembers.userId, userId),
			),
		)
		.then((rows) => rows[0]);

	if (!membership) {
		throw new Error("Member not found");
	}

	if (membership.role === "owner") {
		throw new Error("Cannot change owner role");
	}

	await db
		.update(schema.organizationMembers)
		.set({ role })
		.where(eq(schema.organizationMembers.id, membership.id));
}

export async function removeMember(organizationId: string, userId: string) {
	const session = await requireSession();
	const currentMembership = await requireOrgMembership(session.user.id, organizationId, [
		"owner",
		"admin",
	]);

	const membership = await db
		.select()
		.from(schema.organizationMembers)
		.where(
			and(
				eq(schema.organizationMembers.organizationId, organizationId),
				eq(schema.organizationMembers.userId, userId),
			),
		)
		.then((rows) => rows[0]);

	if (!membership) {
		throw new Error("Member not found");
	}

	if (membership.role === "owner") {
		throw new Error("Cannot remove owner");
	}

	// Admins can only remove members, not other admins
	if (currentMembership.role === "admin" && membership.role === "admin") {
		throw new Error("Admins cannot remove other admins");
	}

	await db
		.delete(schema.organizationMembers)
		.where(eq(schema.organizationMembers.id, membership.id));
}

export async function inviteMember(
	organizationId: string,
	email: string,
	role: "admin" | "member",
) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, organizationId))
		.then((rows) => rows[0]);

	if (!org) {
		throw new Error("Organization not found");
	}

	// Check team member limit
	const memberCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(schema.organizationMembers)
		.where(eq(schema.organizationMembers.organizationId, organizationId))
		.then((rows) => Number(rows[0].count));

	if (org.maxTeamMembers !== -1 && memberCount >= org.maxTeamMembers) {
		throw new Error("Team member limit reached. Upgrade your plan to add more members.");
	}

	// Check for existing invitation
	const normalizedEmail = email.toLowerCase();
	const existingInvite = await db
		.select()
		.from(schema.invitations)
		.where(
			and(
				eq(schema.invitations.email, normalizedEmail),
				eq(schema.invitations.organizationId, organizationId),
			),
		)
		.then((rows) => rows[0]);

	if (existingInvite) {
		throw new Error("Invitation already sent to this email");
	}

	const now = new Date();
	const token = generateToken(32);
	const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await db.insert(schema.invitations).values({
		organizationId,
		email: normalizedEmail,
		role,
		invitedBy: session.user.id,
		token,
		expiresAt,
		createdAt: now,
	});

	// Get inviter profile for the email
	const inviterProfile = await db
		.select()
		.from(schema.userProfiles)
		.where(eq(schema.userProfiles.userId, session.user.id))
		.then((rows) => rows[0]);

	// Send invitation email via Resend
	const resendApiKey = process.env.RESEND_API_KEY;
	if (resendApiKey) {
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const acceptUrl = `${siteUrl}/invite/${token}`;

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Photocall <noreply@photocall.app>",
				to: [normalizedEmail],
				subject: `You've been invited to ${org.name} on Photocall`,
				html: `
					<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
						<h2>You've been invited!</h2>
						<p>${inviterProfile?.name ? `${inviterProfile.name} has` : "Someone has"} invited you to join <strong>${org.name}</strong> on Photocall as a ${role}.</p>
						<p>Click the button below to accept the invitation:</p>
						<a href="${acceptUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
						<p style="color: #666; font-size: 14px; margin-top: 24px;">This invitation expires in 7 days.</p>
						<p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
					</div>
				`,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("Failed to send invitation email:", error);
		}
	} else {
		console.warn("RESEND_API_KEY not set, skipping email");
	}

	return { token };
}

export async function getInvitations(organizationId: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	return await db
		.select()
		.from(schema.invitations)
		.where(eq(schema.invitations.organizationId, organizationId));
}

export async function cancelInvitation(invitationId: string) {
	const session = await requireSession();

	const invitation = await db
		.select()
		.from(schema.invitations)
		.where(eq(schema.invitations.id, invitationId))
		.then((rows) => rows[0]);

	if (!invitation) {
		throw new Error("Invitation not found");
	}

	await requireOrgMembership(session.user.id, invitation.organizationId, ["owner", "admin"]);

	await db.delete(schema.invitations).where(eq(schema.invitations.id, invitationId));
}

export async function acceptInvitation(token: string) {
	const session = await requireSession();
	const userId = session.user.id;

	const invitation = await db
		.select()
		.from(schema.invitations)
		.where(eq(schema.invitations.token, token))
		.then((rows) => rows[0]);

	if (!invitation) {
		throw new Error("Invalid or expired invitation");
	}

	if (invitation.expiresAt < new Date()) {
		await db.delete(schema.invitations).where(eq(schema.invitations.id, invitation.id));
		throw new Error("Invitation has expired");
	}

	// Check if already a member
	const existingMembership = await db
		.select()
		.from(schema.organizationMembers)
		.where(
			and(
				eq(schema.organizationMembers.organizationId, invitation.organizationId),
				eq(schema.organizationMembers.userId, userId),
			),
		)
		.then((rows) => rows[0]);

	if (existingMembership) {
		await db.delete(schema.invitations).where(eq(schema.invitations.id, invitation.id));
		throw new Error("Already a member of this organization");
	}

	// Create membership
	await db.insert(schema.organizationMembers).values({
		organizationId: invitation.organizationId,
		userId,
		role: invitation.role,
		invitedBy: invitation.invitedBy,
		invitedAt: invitation.createdAt,
		joinedAt: new Date(),
	});

	await db.delete(schema.invitations).where(eq(schema.invitations.id, invitation.id));

	return { organizationId: invitation.organizationId };
}

export async function getInvitationByToken(token: string) {
	const invitation = await db
		.select()
		.from(schema.invitations)
		.where(eq(schema.invitations.token, token))
		.then((rows) => rows[0]);

	if (!invitation || invitation.expiresAt < new Date()) {
		return null;
	}

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, invitation.organizationId))
		.then((rows) => rows[0]);

	return {
		...invitation,
		organizationName: org?.name ?? null,
	};
}

export async function getUsage(organizationId: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, organizationId))
		.then((rows) => rows[0]);

	if (!org) return null;

	const events = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.organizationId, organizationId));

	const totalPhotos = events.reduce((sum, e) => sum + e.photoCount, 0);
	const totalSessions = events.reduce((sum, e) => sum + e.sessionCount, 0);

	const memberCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(schema.organizationMembers)
		.where(eq(schema.organizationMembers.organizationId, organizationId))
		.then((rows) => Number(rows[0].count));

	return {
		events: {
			used: events.length,
			limit: org.maxEvents,
		},
		storage: {
			used: org.currentStorageBytes,
			limit: org.maxStorageBytes,
		},
		teamMembers: {
			used: memberCount,
			limit: org.maxTeamMembers,
		},
		photos: totalPhotos,
		sessions: totalSessions,
	};
}

export async function generateOrgUploadUrl(organizationId: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	return await generateUploadUrl(`orgs/${organizationId}`, "image/png");
}
