import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random share token (16 chars)
function generateShareToken(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < 16; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// Generate a human-readable code (ABCD-1234)
function generateHumanCode(): string {
	const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // excluded I and O to avoid confusion
	const digits = "0123456789";

	let code = "";
	for (let i = 0; i < 4; i++) {
		code += letters.charAt(Math.floor(Math.random() * letters.length));
	}
	code += "-";
	for (let i = 0; i < 4; i++) {
		code += digits.charAt(Math.floor(Math.random() * digits.length));
	}
	return code;
}

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});

export const create = mutation({
	args: {
		sessionId: v.id("sessions"),
		storageId: v.id("_storage"),
		caption: v.optional(v.string()),
		templateId: v.optional(v.id("templates")),
		width: v.number(),
		height: v.number(),
	},
	handler: async (ctx, args) => {
		// Get settings for expiration
		const settings = await ctx.db.query("settings").first();
		const expirationDays = settings?.shareExpirationDays;

		const shareToken = generateShareToken();
		const humanCode = generateHumanCode();
		const now = Date.now();

		const photoId = await ctx.db.insert("photos", {
			sessionId: args.sessionId,
			storageId: args.storageId,
			shareToken,
			humanCode,
			caption: args.caption,
			templateId: args.templateId,
			width: args.width,
			height: args.height,
			expiresAt: expirationDays ? now + expirationDays * 24 * 60 * 60 * 1000 : undefined,
			createdAt: now,
		});

		return { photoId, shareToken, humanCode };
	},
});

export const getByShareToken = query({
	args: {
		shareToken: v.string(),
	},
	handler: async (ctx, args) => {
		const photo = await ctx.db
			.query("photos")
			.withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
			.first();

		if (!photo) return null;

		// Check expiration
		if (photo.expiresAt && photo.expiresAt < Date.now()) {
			return null;
		}

		const url = await ctx.storage.getUrl(photo.storageId);
		return { ...photo, url };
	},
});

export const getByHumanCode = query({
	args: {
		humanCode: v.string(),
	},
	handler: async (ctx, args) => {
		const photo = await ctx.db
			.query("photos")
			.withIndex("by_human_code", (q) => q.eq("humanCode", args.humanCode.toUpperCase()))
			.first();

		if (!photo) return null;

		// Check expiration
		if (photo.expiresAt && photo.expiresAt < Date.now()) {
			return null;
		}

		return { shareToken: photo.shareToken };
	},
});

export const list = query({
	args: {
		limit: v.optional(v.number()),
		cursor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_created_at")
			.order("desc")
			.take(limit + 1);

		const hasMore = photos.length > limit;
		const items = hasMore ? photos.slice(0, limit) : photos;

		// Get URLs for all photos
		const photosWithUrls = await Promise.all(
			items.map(async (photo) => {
				const url = await ctx.storage.getUrl(photo.storageId);
				return { ...photo, url };
			}),
		);

		return {
			items: photosWithUrls,
			hasMore,
			nextCursor: hasMore ? items[items.length - 1]._id : undefined,
		};
	},
});

export const listRecent = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_created_at")
			.order("desc")
			.take(limit);

		const photosWithUrls = await Promise.all(
			photos.map(async (photo) => {
				const url = await ctx.storage.getUrl(photo.storageId);
				return { ...photo, url };
			}),
		);

		return photosWithUrls;
	},
});

export const get = query({
	args: {
		photoId: v.id("photos"),
	},
	handler: async (ctx, args) => {
		const photo = await ctx.db.get(args.photoId);
		if (!photo) return null;

		const url = await ctx.storage.getUrl(photo.storageId);
		return { ...photo, url };
	},
});

export const remove = mutation({
	args: {
		photoId: v.id("photos"),
	},
	handler: async (ctx, args) => {
		const photo = await ctx.db.get(args.photoId);
		if (photo) {
			await ctx.storage.delete(photo.storageId);
			await ctx.db.delete(args.photoId);
		}
	},
});

export const removeAll = mutation({
	args: {},
	handler: async (ctx) => {
		const photos = await ctx.db.query("photos").collect();
		for (const photo of photos) {
			await ctx.storage.delete(photo.storageId);
			await ctx.db.delete(photo._id);
		}
		return { deleted: photos.length };
	},
});

export const getCount = query({
	args: {},
	handler: async (ctx) => {
		const photos = await ctx.db.query("photos").collect();
		return photos.length;
	},
});
