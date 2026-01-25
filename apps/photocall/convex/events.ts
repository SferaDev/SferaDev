import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	generateSlug,
	hashPin,
	requireAuth,
	requireEventAccess,
	requireOrgMembership,
	verifyPin,
} from "./lib/auth";

export const create = mutation({
	args: {
		organizationId: v.id("organizations"),
		name: v.string(),
		description: v.optional(v.string()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId, ["owner", "admin"]);

		const org = await ctx.db.get(args.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		// Check event limit
		const eventCount = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		if (org.maxEvents !== -1 && eventCount.length >= org.maxEvents) {
			throw new Error("Event limit reached. Upgrade your plan to create more events.");
		}

		// Generate unique slug within organization
		const baseSlug = generateSlug(args.name);
		let slug = baseSlug;
		let counter = 1;

		while (true) {
			const existing = await ctx.db
				.query("events")
				.withIndex("by_org_slug", (q) =>
					q.eq("organizationId", args.organizationId).eq("slug", slug),
				)
				.unique();
			if (!existing) break;
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		const now = Date.now();

		return await ctx.db.insert("events", {
			organizationId: args.organizationId,
			name: args.name,
			slug,
			description: args.description,
			startDate: args.startDate,
			endDate: args.endDate,
			status: "draft",
			slideshowEnabled: true,
			slideshowSafeMode: false,
			idleTimeoutSeconds: 120,
			defaultCamera: "user",
			photoQuality: 0.9,
			maxPhotoDimension: 1920,
			allowDownload: true,
			allowPrint: true,
			showQrCode: true,
			photoCount: 0,
			sessionCount: 0,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const list = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireOrgMembership(ctx, userId, args.organizationId);

		const events = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
			.collect();

		return Promise.all(
			events.map(async (event) => ({
				...event,
				logoUrl: event.logoStorageId ? await ctx.storage.getUrl(event.logoStorageId) : null,
			})),
		);
	},
});

export const get = query({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const { event } = await requireEventAccess(ctx, userId, args.id);

		return {
			...event,
			logoUrl: event.logoStorageId ? await ctx.storage.getUrl(event.logoStorageId) : null,
		};
	},
});

export const getBySlug = query({
	args: { organizationSlug: v.string(), eventSlug: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const org = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.organizationSlug))
			.unique();

		if (!org) return null;

		await requireOrgMembership(ctx, userId, org._id);

		const event = await ctx.db
			.query("events")
			.withIndex("by_org_slug", (q) => q.eq("organizationId", org._id).eq("slug", args.eventSlug))
			.unique();

		if (!event) return null;

		return {
			...event,
			organization: org,
			logoUrl: event.logoStorageId ? await ctx.storage.getUrl(event.logoStorageId) : null,
		};
	},
});

export const update = mutation({
	args: {
		id: v.id("events"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("archived")),
		),
		slideshowEnabled: v.optional(v.boolean()),
		slideshowSafeMode: v.optional(v.boolean()),
		idleTimeoutSeconds: v.optional(v.number()),
		defaultCamera: v.optional(v.union(v.literal("user"), v.literal("environment"))),
		photoQuality: v.optional(v.number()),
		maxPhotoDimension: v.optional(v.number()),
		primaryColor: v.optional(v.string()),
		logoStorageId: v.optional(v.id("_storage")),
		welcomeMessage: v.optional(v.string()),
		thankYouMessage: v.optional(v.string()),
		shareExpirationDays: v.optional(v.number()),
		allowDownload: v.optional(v.boolean()),
		allowPrint: v.optional(v.boolean()),
		showQrCode: v.optional(v.boolean()),
		retentionDays: v.optional(v.number()),
		deleteAfterDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.id, ["owner", "admin"]);

		const { id, ...updates } = args;
		await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const setKioskPin = mutation({
	args: {
		id: v.id("events"),
		pin: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.id, ["owner", "admin"]);

		if (args.pin.length < 4) {
			throw new Error("PIN must be at least 4 characters");
		}

		const { hash, salt } = await hashPin(args.pin);

		await ctx.db.patch(args.id, {
			kioskPinHash: hash,
			kioskPinSalt: salt,
			updatedAt: Date.now(),
		});
	},
});

export const validateKioskPin = mutation({
	args: {
		id: v.id("events"),
		pin: v.string(),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.id);
		if (!event) {
			throw new Error("Event not found");
		}

		if (!event.kioskPinHash || !event.kioskPinSalt) {
			throw new Error("No PIN set for this event");
		}

		const isValid = await verifyPin(args.pin, event.kioskPinHash, event.kioskPinSalt);
		if (!isValid) {
			throw new Error("Invalid PIN");
		}

		return true;
	},
});

export const remove = mutation({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const { event } = await requireEventAccess(ctx, userId, args.id, ["owner", "admin"]);

		// Delete all photos and update storage
		const photos = await ctx.db
			.query("photos")
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
			.collect();

		let totalStorageFreed = 0;
		for (const photo of photos) {
			await ctx.storage.delete(photo.storageId);
			totalStorageFreed += photo.sizeBytes;
			await ctx.db.delete(photo._id);
		}

		// Update organization storage
		const org = await ctx.db.get(event.organizationId);
		if (org) {
			await ctx.db.patch(org._id, {
				currentStorageBytes: Math.max(0, org.currentStorageBytes - totalStorageFreed),
				updatedAt: Date.now(),
			});
		}

		// Delete templates
		const templates = await ctx.db
			.query("templates")
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
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
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
			.collect();

		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}

		await ctx.db.delete(args.id);
	},
});

export const duplicate = mutation({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const { event } = await requireEventAccess(ctx, userId, args.id, ["owner", "admin"]);

		const org = await ctx.db.get(event.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		// Check event limit
		const eventCount = await ctx.db
			.query("events")
			.withIndex("by_organization", (q) => q.eq("organizationId", event.organizationId))
			.collect();

		if (org.maxEvents !== -1 && eventCount.length >= org.maxEvents) {
			throw new Error("Event limit reached. Upgrade your plan to create more events.");
		}

		// Generate new slug
		const baseSlug = `${event.slug}-copy`;
		let slug = baseSlug;
		let counter = 1;

		while (true) {
			const existing = await ctx.db
				.query("events")
				.withIndex("by_org_slug", (q) =>
					q.eq("organizationId", event.organizationId).eq("slug", slug),
				)
				.unique();
			if (!existing) break;
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		const now = Date.now();

		const newEventId = await ctx.db.insert("events", {
			organizationId: event.organizationId,
			name: `${event.name} (Copy)`,
			slug,
			description: event.description,
			status: "draft",
			slideshowEnabled: event.slideshowEnabled,
			slideshowSafeMode: event.slideshowSafeMode,
			idleTimeoutSeconds: event.idleTimeoutSeconds,
			defaultCamera: event.defaultCamera,
			photoQuality: event.photoQuality,
			maxPhotoDimension: event.maxPhotoDimension,
			primaryColor: event.primaryColor,
			welcomeMessage: event.welcomeMessage,
			thankYouMessage: event.thankYouMessage,
			shareExpirationDays: event.shareExpirationDays,
			allowDownload: event.allowDownload,
			allowPrint: event.allowPrint,
			showQrCode: event.showQrCode,
			retentionDays: event.retentionDays,
			photoCount: 0,
			sessionCount: 0,
			createdAt: now,
			updatedAt: now,
		});

		// Duplicate templates (but not the actual files - just reference them)
		const templates = await ctx.db
			.query("templates")
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
			.collect();

		for (const template of templates) {
			await ctx.db.insert("templates", {
				eventId: newEventId,
				name: template.name,
				storageId: template.storageId,
				thumbnailStorageId: template.thumbnailStorageId,
				enabled: template.enabled,
				order: template.order,
				captionPosition: template.captionPosition,
				safeArea: template.safeArea,
				createdAt: now,
				updatedAt: now,
			});
		}

		return newEventId;
	},
});

export const getStats = query({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.id);

		const event = await ctx.db.get(args.id);
		if (!event) return null;

		// Get recent sessions
		const recentSessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
			.order("desc")
			.take(10);

		// Calculate session stats
		const allSessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.id))
			.collect();

		const completedSessions = allSessions.filter((s) => s.status === "completed");
		const conversionRate =
			allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0;

		return {
			photoCount: event.photoCount,
			sessionCount: event.sessionCount,
			completedSessions: completedSessions.length,
			conversionRate,
			recentSessions,
		};
	},
});

// Public query for kiosk mode (no auth required)
export const getPublic = query({
	args: { organizationSlug: v.string(), eventSlug: v.string() },
	handler: async (ctx, args) => {
		const org = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.organizationSlug))
			.unique();

		if (!org) return null;

		const event = await ctx.db
			.query("events")
			.withIndex("by_org_slug", (q) => q.eq("organizationId", org._id).eq("slug", args.eventSlug))
			.unique();

		if (!event || event.status !== "active") return null;

		return {
			id: event._id,
			name: event.name,
			organizationName: org.name,
			welcomeMessage: event.welcomeMessage,
			thankYouMessage: event.thankYouMessage,
			primaryColor: event.primaryColor,
			logoUrl: event.logoStorageId ? await ctx.storage.getUrl(event.logoStorageId) : null,
			slideshowEnabled: event.slideshowEnabled,
			slideshowSafeMode: event.slideshowSafeMode,
			idleTimeoutSeconds: event.idleTimeoutSeconds,
			defaultCamera: event.defaultCamera,
			photoQuality: event.photoQuality,
			maxPhotoDimension: event.maxPhotoDimension,
			allowDownload: event.allowDownload,
			allowPrint: event.allowPrint,
			showQrCode: event.showQrCode,
		};
	},
});

export const generateUploadUrl = mutation({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId, ["owner", "admin"]);

		return await ctx.storage.generateUploadUrl();
	},
});
