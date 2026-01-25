import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateSlug, generateToken, requireAuth, requireOrgMembership } from "./lib/auth";
import { PLAN_LIMITS } from "./lib/plans";

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		// Check if user already has an organization (free tier limit)
		const existingMemberships = await ctx.db
			.query("organizationMembers")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const ownedOrgs = await Promise.all(
			existingMemberships.map(async (m) => {
				const org = await ctx.db.get(m.organizationId);
				return org?.ownerId === userId ? org : null;
			}),
		);

		const ownedCount = ownedOrgs.filter(Boolean).length;
		if (ownedCount >= 1) {
			throw new Error("You can only own one organization on the free tier");
		}

		// Generate unique slug
		const baseSlug = generateSlug(args.name);
		let slug = baseSlug;
		let counter = 1;

		while (true) {
			const existing = await ctx.db
				.query("organizations")
				.withIndex("by_slug", (q) => q.eq("slug", slug))
				.unique();
			if (!existing) break;
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		const now = Date.now();
		const freeLimits = PLAN_LIMITS.free;

		const orgId = await ctx.db.insert("organizations", {
			name: args.name,
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
		});

		// Add owner as member
		await ctx.db.insert("organizationMembers", {
			organizationId: orgId,
			userId,
			role: "owner",
			joinedAt: now,
		});

		return orgId;
	},
});

export const get = query({
	args: { id: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.id);

		const org = await ctx.db.get(args.id);
		if (!org) return null;

		const logoUrl = org.logoStorageId ? await ctx.storage.getUrl(org.logoStorageId) : null;

		return {
			...org,
			logoUrl,
		};
	},
});

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const org = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		if (!org) return null;

		await requireOrgMembership(ctx, userId, org._id);

		const logoUrl = org.logoStorageId ? await ctx.storage.getUrl(org.logoStorageId) : null;

		return {
			...org,
			logoUrl,
		};
	},
});

export const update = mutation({
	args: {
		id: v.id("organizations"),
		name: v.optional(v.string()),
		logoStorageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.id, ["owner", "admin"]);

		const { id, ...updates } = args;
		await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const remove = mutation({
	args: { id: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.id, ["owner"]);

		// Delete all related data
		const events = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.id))
			.collect();

		for (const event of events) {
			// Delete photos
			const photos = await ctx.db
				.query("photos")
				.withIndex("by_event", (q) => q.eq("eventId", event._id))
				.collect();

			for (const photo of photos) {
				await ctx.storage.delete(photo.storageId);
				await ctx.db.delete(photo._id);
			}

			// Delete templates
			const templates = await ctx.db
				.query("templates")
				.withIndex("by_event", (q) => q.eq("eventId", event._id))
				.collect();

			for (const template of templates) {
				await ctx.storage.delete(template.storageId);
				if (template.thumbnailStorageId) {
					await ctx.storage.delete(template.thumbnailStorageId);
				}
				await ctx.db.delete(template._id);
			}

			// Delete sessions
			const sessions = await ctx.db
				.query("sessions")
				.withIndex("by_event", (q) => q.eq("eventId", event._id))
				.collect();

			for (const session of sessions) {
				await ctx.db.delete(session._id);
			}

			await ctx.db.delete(event._id);
		}

		// Delete memberships
		const memberships = await ctx.db
			.query("organizationMembers")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.id))
			.collect();

		for (const membership of memberships) {
			await ctx.db.delete(membership._id);
		}

		// Delete invitations
		const invitations = await ctx.db
			.query("invitations")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.id))
			.collect();

		for (const invitation of invitations) {
			await ctx.db.delete(invitation._id);
		}

		// Delete usage logs
		const usageLogs = await ctx.db
			.query("usageLogs")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.id))
			.collect();

		for (const log of usageLogs) {
			await ctx.db.delete(log._id);
		}

		await ctx.db.delete(args.id);
	},
});

export const getMembers = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId);

		const memberships = await ctx.db
			.query("organizationMembers")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		const members = await Promise.all(
			memberships.map(async (m) => {
				const user = await ctx.db.get(m.userId);
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_user", (q) => q.eq("userId", m.userId))
					.unique();

				return {
					...m,
					user,
					profile,
				};
			}),
		);

		return members;
	},
});

export const updateMemberRole = mutation({
	args: {
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		const currentUserId = await requireAuth(ctx);
		await requireOrgMembership(ctx, currentUserId, args.organizationId, ["owner"]);

		const membership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_org_user", (q) =>
				q.eq("organizationId", args.organizationId).eq("userId", args.userId),
			)
			.unique();

		if (!membership) {
			throw new Error("Member not found");
		}

		if (membership.role === "owner") {
			throw new Error("Cannot change owner role");
		}

		await ctx.db.patch(membership._id, { role: args.role });
	},
});

export const removeMember = mutation({
	args: {
		organizationId: v.id("organizations"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const currentUserId = await requireAuth(ctx);
		const currentMembership = await requireOrgMembership(ctx, currentUserId, args.organizationId, [
			"owner",
			"admin",
		]);

		const membership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_org_user", (q) =>
				q.eq("organizationId", args.organizationId).eq("userId", args.userId),
			)
			.unique();

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

		await ctx.db.delete(membership._id);
	},
});

export const invite = mutation({
	args: {
		organizationId: v.id("organizations"),
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId, ["owner", "admin"]);

		const org = await ctx.db.get(args.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		// Check team member limit
		const memberCount = await ctx.db
			.query("organizationMembers")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		if (org.maxTeamMembers !== -1 && memberCount.length >= org.maxTeamMembers) {
			throw new Error("Team member limit reached. Upgrade your plan to add more members.");
		}

		// Check for existing invitation
		const existingInvite = await ctx.db
			.query("invitations")
			.withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
			.first();

		if (existingInvite && existingInvite.organizationId === args.organizationId) {
			throw new Error("Invitation already sent to this email");
		}

		const now = Date.now();
		const token = generateToken(32);

		await ctx.db.insert("invitations", {
			organizationId: args.organizationId,
			email: args.email.toLowerCase(),
			role: args.role,
			invitedBy: userId,
			token,
			expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
			createdAt: now,
		});

		return { token };
	},
});

export const getInvitations = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId, ["owner", "admin"]);

		return await ctx.db
			.query("invitations")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();
	},
});

export const cancelInvitation = mutation({
	args: { invitationId: v.id("invitations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const invitation = await ctx.db.get(args.invitationId);

		if (!invitation) {
			throw new Error("Invitation not found");
		}

		await requireOrgMembership(ctx, userId, invitation.organizationId, ["owner", "admin"]);
		await ctx.db.delete(args.invitationId);
	},
});

export const acceptInvitation = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const invitation = await ctx.db
			.query("invitations")
			.withIndex("by_token", (q) => q.eq("token", args.token))
			.unique();

		if (!invitation) {
			throw new Error("Invalid or expired invitation");
		}

		if (invitation.expiresAt < Date.now()) {
			await ctx.db.delete(invitation._id);
			throw new Error("Invitation has expired");
		}

		// Check if already a member
		const existingMembership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_org_user", (q) =>
				q.eq("organizationId", invitation.organizationId).eq("userId", userId),
			)
			.unique();

		if (existingMembership) {
			await ctx.db.delete(invitation._id);
			throw new Error("Already a member of this organization");
		}

		// Create membership
		await ctx.db.insert("organizationMembers", {
			organizationId: invitation.organizationId,
			userId,
			role: invitation.role,
			invitedBy: invitation.invitedBy,
			invitedAt: invitation.createdAt,
			joinedAt: Date.now(),
		});

		await ctx.db.delete(invitation._id);

		return { organizationId: invitation.organizationId };
	},
});

export const getInvitationByToken = query({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const invitation = await ctx.db
			.query("invitations")
			.withIndex("by_token", (q) => q.eq("token", args.token))
			.unique();

		if (!invitation || invitation.expiresAt < Date.now()) {
			return null;
		}

		const org = await ctx.db.get(invitation.organizationId);

		return {
			...invitation,
			organizationName: org?.name,
		};
	},
});

export const getUsage = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId);

		const org = await ctx.db.get(args.organizationId);
		if (!org) return null;

		const events = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		const totalPhotos = events.reduce((sum, e) => sum + e.photoCount, 0);
		const totalSessions = events.reduce((sum, e) => sum + e.sessionCount, 0);

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
				used: await ctx.db
					.query("organizationMembers")
					.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
					.collect()
					.then((m) => m.length),
				limit: org.maxTeamMembers,
			},
			photos: totalPhotos,
			sessions: totalSessions,
		};
	},
});

export const generateUploadUrl = mutation({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId, ["owner", "admin"]);

		return await ctx.storage.generateUploadUrl();
	},
});
