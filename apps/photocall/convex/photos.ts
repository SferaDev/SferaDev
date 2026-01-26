import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateToken, requireAuth, requireEventAccess } from "./lib/auth";

// Generate a human-readable code (ABCD-1234)
function generateHumanCode(): string {
	const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
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

// Public mutation for kiosk mode
export const generateUploadUrl = mutation({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		// Verify event exists and is active
		const event = await ctx.db.get(args.eventId);
		if (!event || event.status !== "active") {
			throw new Error("Event not found or not active");
		}

		return await ctx.storage.generateUploadUrl();
	},
});

// Public mutation for kiosk mode
export const create = mutation({
	args: {
		eventId: v.id("events"),
		sessionId: v.id("sessions"),
		storageId: v.id("_storage"),
		caption: v.optional(v.string()),
		templateId: v.optional(v.id("templates")),
		width: v.number(),
		height: v.number(),
		sizeBytes: v.number(),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event || event.status !== "active") {
			throw new Error("Event not found or not active");
		}

		const org = await ctx.db.get(event.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		// Check photo limit
		if (org.maxPhotosPerEvent !== -1 && event.photoCount >= org.maxPhotosPerEvent) {
			throw new Error("Photo limit reached for this event");
		}

		// Check storage limit
		if (org.currentStorageBytes + args.sizeBytes > org.maxStorageBytes) {
			throw new Error("Storage limit reached. Upgrade your plan for more storage.");
		}

		const shareToken = generateToken(16);
		const humanCode = generateHumanCode();
		const now = Date.now();

		const photoId = await ctx.db.insert("photos", {
			eventId: args.eventId,
			sessionId: args.sessionId,
			storageId: args.storageId,
			shareToken,
			humanCode,
			caption: args.caption,
			templateId: args.templateId,
			width: args.width,
			height: args.height,
			sizeBytes: args.sizeBytes,
			expiresAt: event.shareExpirationDays
				? now + event.shareExpirationDays * 24 * 60 * 60 * 1000
				: undefined,
			createdAt: now,
		});

		// Update event stats
		await ctx.db.patch(args.eventId, {
			photoCount: event.photoCount + 1,
			updatedAt: now,
		});

		// Update organization storage
		await ctx.db.patch(org._id, {
			currentStorageBytes: org.currentStorageBytes + args.sizeBytes,
			updatedAt: now,
		});

		// Log usage
		await ctx.db.insert("usageLogs", {
			organizationId: org._id,
			eventId: args.eventId,
			type: "photo_captured",
			bytes: args.sizeBytes,
			createdAt: now,
		});

		return { photoId, shareToken, humanCode };
	},
});

// Public query for share page
export const getByShareToken = query({
	args: { shareToken: v.string() },
	handler: async (ctx, args) => {
		const photo = await ctx.db
			.query("photos")
			.withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
			.first();

		if (!photo) return null;

		if (photo.expiresAt && photo.expiresAt < Date.now()) {
			return null;
		}

		const event = await ctx.db.get(photo.eventId);
		if (!event) return null;

		const url = await ctx.storage.getUrl(photo.storageId);

		return {
			...photo,
			url,
			eventName: event.name,
			allowDownload: event.allowDownload,
			allowPrint: event.allowPrint,
			showQrCode: event.showQrCode,
		};
	},
});

// Public query for share page
export const getByHumanCode = query({
	args: { humanCode: v.string() },
	handler: async (ctx, args) => {
		const photo = await ctx.db
			.query("photos")
			.withIndex("by_human_code", (q) => q.eq("humanCode", args.humanCode.toUpperCase()))
			.first();

		if (!photo) return null;

		if (photo.expiresAt && photo.expiresAt < Date.now()) {
			return null;
		}

		return { shareToken: photo.shareToken };
	},
});

// Authenticated queries for admin
export const list = query({
	args: {
		eventId: v.id("events"),
		limit: v.optional(v.number()),
		cursor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const limit = args.limit ?? 20;

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.order("desc")
			.take(limit + 1);

		const hasMore = photos.length > limit;
		const items = hasMore ? photos.slice(0, limit) : photos;

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
		eventId: v.id("events"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const limit = args.limit ?? 10;

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
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

// Public query for kiosk slideshow
export const listRecentPublic = query({
	args: {
		eventId: v.id("events"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event || event.status !== "active") {
			return [];
		}

		const limit = args.limit ?? 10;

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.order("desc")
			.take(limit);

		const photosWithUrls = await Promise.all(
			photos.map(async (photo) => {
				const url = await ctx.storage.getUrl(photo.storageId);
				return {
					_id: photo._id,
					url,
					humanCode: photo.humanCode,
					createdAt: photo.createdAt,
				};
			}),
		);

		return photosWithUrls;
	},
});

export const get = query({
	args: { photoId: v.id("photos") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const photo = await ctx.db.get(args.photoId);
		if (!photo) return null;

		await requireEventAccess(ctx, userId, photo.eventId);

		const url = await ctx.storage.getUrl(photo.storageId);
		return { ...photo, url };
	},
});

export const remove = mutation({
	args: { photoId: v.id("photos") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const photo = await ctx.db.get(args.photoId);
		if (!photo) return;

		const { event } = await requireEventAccess(ctx, userId, photo.eventId, ["owner", "admin"]);

		const org = await ctx.db.get(event.organizationId);

		await ctx.storage.delete(photo.storageId);
		await ctx.db.delete(args.photoId);

		// Update event stats
		await ctx.db.patch(photo.eventId, {
			photoCount: Math.max(0, event.photoCount - 1),
			updatedAt: Date.now(),
		});

		// Update organization storage
		if (org) {
			await ctx.db.patch(org._id, {
				currentStorageBytes: Math.max(0, org.currentStorageBytes - photo.sizeBytes),
				updatedAt: Date.now(),
			});

			// Log usage
			await ctx.db.insert("usageLogs", {
				organizationId: org._id,
				eventId: photo.eventId,
				type: "storage_removed",
				bytes: photo.sizeBytes,
				createdAt: Date.now(),
			});
		}
	},
});

export const removeAll = mutation({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const { event } = await requireEventAccess(ctx, userId, args.eventId, ["owner", "admin"]);

		const org = await ctx.db.get(event.organizationId);

		const photos = await ctx.db
			.query("photos")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		let totalStorageFreed = 0;
		for (const photo of photos) {
			await ctx.storage.delete(photo.storageId);
			totalStorageFreed += photo.sizeBytes;
			await ctx.db.delete(photo._id);
		}

		// Update event stats
		await ctx.db.patch(args.eventId, {
			photoCount: 0,
			updatedAt: Date.now(),
		});

		// Update organization storage
		if (org) {
			await ctx.db.patch(org._id, {
				currentStorageBytes: Math.max(0, org.currentStorageBytes - totalStorageFreed),
				updatedAt: Date.now(),
			});

			// Log usage
			await ctx.db.insert("usageLogs", {
				organizationId: org._id,
				eventId: args.eventId,
				type: "storage_removed",
				bytes: totalStorageFreed,
				createdAt: Date.now(),
			});
		}

		return { deleted: photos.length };
	},
});

export const getCount = query({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const event = await ctx.db.get(args.eventId);
		return event?.photoCount ?? 0;
	},
});
