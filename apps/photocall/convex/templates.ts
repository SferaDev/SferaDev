import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireEventAccess } from "./lib/auth";

export const generateUploadUrl = mutation({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId, ["owner", "admin"]);

		return await ctx.storage.generateUploadUrl();
	},
});

export const create = mutation({
	args: {
		eventId: v.id("events"),
		name: v.string(),
		storageId: v.id("_storage"),
		thumbnailStorageId: v.optional(v.id("_storage")),
		captionPosition: v.optional(
			v.object({
				x: v.number(),
				y: v.number(),
				maxWidth: v.number(),
				fontSize: v.number(),
				color: v.string(),
				align: v.union(v.literal("left"), v.literal("center"), v.literal("right")),
			}),
		),
		safeArea: v.optional(
			v.object({
				x: v.number(),
				y: v.number(),
				width: v.number(),
				height: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId, ["owner", "admin"]);

		// Get the max order for this event
		const templates = await ctx.db
			.query("templates")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();
		const maxOrder = templates.reduce((max, t) => Math.max(max, t.order), 0);

		const now = Date.now();
		return await ctx.db.insert("templates", {
			eventId: args.eventId,
			name: args.name,
			storageId: args.storageId,
			thumbnailStorageId: args.thumbnailStorageId,
			enabled: true,
			order: maxOrder + 1,
			captionPosition: args.captionPosition,
			safeArea: args.safeArea,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		templateId: v.id("templates"),
		name: v.optional(v.string()),
		enabled: v.optional(v.boolean()),
		order: v.optional(v.number()),
		captionPosition: v.optional(
			v.object({
				x: v.number(),
				y: v.number(),
				maxWidth: v.number(),
				fontSize: v.number(),
				color: v.string(),
				align: v.union(v.literal("left"), v.literal("center"), v.literal("right")),
			}),
		),
		safeArea: v.optional(
			v.object({
				x: v.number(),
				y: v.number(),
				width: v.number(),
				height: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw new Error("Template not found");
		}

		await requireEventAccess(ctx, userId, template.eventId, ["owner", "admin"]);

		const { templateId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, v]) => v !== undefined),
		);

		await ctx.db.patch(templateId, {
			...filteredUpdates,
			updatedAt: Date.now(),
		});
	},
});

export const remove = mutation({
	args: { templateId: v.id("templates") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const template = await ctx.db.get(args.templateId);
		if (!template) return;

		await requireEventAccess(ctx, userId, template.eventId, ["owner", "admin"]);

		await ctx.storage.delete(template.storageId);
		if (template.thumbnailStorageId) {
			await ctx.storage.delete(template.thumbnailStorageId);
		}
		await ctx.db.delete(args.templateId);
	},
});

export const list = query({
	args: {
		eventId: v.id("events"),
		enabledOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const templates = args.enabledOnly
			? await ctx.db
					.query("templates")
					.withIndex("by_event_enabled_order", (q) =>
						q.eq("eventId", args.eventId).eq("enabled", true),
					)
					.collect()
			: await ctx.db
					.query("templates")
					.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
					.collect();

		templates.sort((a, b) => a.order - b.order);

		const templatesWithUrls = await Promise.all(
			templates.map(async (template) => {
				const url = await ctx.storage.getUrl(template.storageId);
				const thumbnailUrl = template.thumbnailStorageId
					? await ctx.storage.getUrl(template.thumbnailStorageId)
					: null;
				return { ...template, url, thumbnailUrl };
			}),
		);

		return templatesWithUrls;
	},
});

// Public query for kiosk mode
export const listPublic = query({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event || event.status !== "active") {
			return [];
		}

		const templates = await ctx.db
			.query("templates")
			.withIndex("by_event_enabled_order", (q) => q.eq("eventId", args.eventId).eq("enabled", true))
			.collect();

		templates.sort((a, b) => a.order - b.order);

		const templatesWithUrls = await Promise.all(
			templates.map(async (template) => {
				const url = await ctx.storage.getUrl(template.storageId);
				const thumbnailUrl = template.thumbnailStorageId
					? await ctx.storage.getUrl(template.thumbnailStorageId)
					: url;
				return {
					_id: template._id,
					name: template.name,
					url,
					thumbnailUrl,
					captionPosition: template.captionPosition,
					safeArea: template.safeArea,
				};
			}),
		);

		return templatesWithUrls;
	},
});

export const get = query({
	args: { templateId: v.id("templates") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const template = await ctx.db.get(args.templateId);
		if (!template) return null;

		await requireEventAccess(ctx, userId, template.eventId);

		const url = await ctx.storage.getUrl(template.storageId);
		const thumbnailUrl = template.thumbnailStorageId
			? await ctx.storage.getUrl(template.thumbnailStorageId)
			: null;

		return { ...template, url, thumbnailUrl };
	},
});

export const reorder = mutation({
	args: {
		eventId: v.id("events"),
		templateIds: v.array(v.id("templates")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId, ["owner", "admin"]);

		for (let i = 0; i < args.templateIds.length; i++) {
			await ctx.db.patch(args.templateIds[i], {
				order: i + 1,
				updatedAt: Date.now(),
			});
		}
	},
});
