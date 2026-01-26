import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserProfile, requireAuth } from "./lib/auth";

export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);
		const user = await ctx.db.get(userId);
		const profile = await getUserProfile(ctx, userId);

		return {
			user,
			profile,
		};
	},
});

export const getProfile = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);
		return await getUserProfile(ctx, userId);
	},
});

export const createProfile = mutation({
	args: {
		name: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const existing = await getUserProfile(ctx, userId);
		if (existing) {
			throw new Error("Profile already exists");
		}

		const now = Date.now();
		return await ctx.db.insert("userProfiles", {
			userId,
			name: args.name,
			onboardingCompleted: false,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const profile = await getUserProfile(ctx, userId);

		if (!profile) {
			throw new Error("Profile not found");
		}

		await ctx.db.patch(profile._id, {
			...args,
			updatedAt: Date.now(),
		});
	},
});

export const completeOnboarding = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);
		const profile = await getUserProfile(ctx, userId);

		if (!profile) {
			throw new Error("Profile not found");
		}

		await ctx.db.patch(profile._id, {
			onboardingCompleted: true,
			updatedAt: Date.now(),
		});
	},
});

export const getOrganizations = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const memberships = await ctx.db
			.query("organizationMembers")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const orgs = await Promise.all(
			memberships.map(async (membership) => {
				const org = await ctx.db.get(membership.organizationId);
				return org
					? {
							...org,
							role: membership.role,
							logoUrl: org.logoStorageId ? await ctx.storage.getUrl(org.logoStorageId) : null,
						}
					: null;
			}),
		);

		return orgs.filter((org) => org !== null);
	},
});
