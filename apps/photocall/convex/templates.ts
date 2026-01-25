import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});

export const create = mutation({
	args: {
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
		// Get the max order
		const templates = await ctx.db.query("templates").collect();
		const maxOrder = templates.reduce((max, t) => Math.max(max, t.order), 0);

		const now = Date.now();
		const templateId = await ctx.db.insert("templates", {
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

		return templateId;
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
		const { templateId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, v]) => v !== undefined),
		);

		await ctx.db.patch(templateId, {
			...filteredUpdates,
			updatedAt: Date.now(),
		});
	},
});

export const remove = mutation({
	args: {
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (template) {
			await ctx.storage.delete(template.storageId);
			if (template.thumbnailStorageId) {
				await ctx.storage.delete(template.thumbnailStorageId);
			}
			await ctx.db.delete(args.templateId);
		}
	},
});

export const list = query({
	args: {
		enabledOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const templates = args.enabledOnly
			? await ctx.db
					.query("templates")
					.withIndex("by_enabled_order", (q) => q.eq("enabled", true))
					.collect()
			: await ctx.db.query("templates").collect();

		// Sort by order
		templates.sort((a, b) => a.order - b.order);

		// Get URLs for all templates
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

export const get = query({
	args: {
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) return null;

		const url = await ctx.storage.getUrl(template.storageId);
		const thumbnailUrl = template.thumbnailStorageId
			? await ctx.storage.getUrl(template.thumbnailStorageId)
			: null;

		return { ...template, url, thumbnailUrl };
	},
});

export const reorder = mutation({
	args: {
		templateIds: v.array(v.id("templates")),
	},
	handler: async (ctx, args) => {
		for (let i = 0; i < args.templateIds.length; i++) {
			await ctx.db.patch(args.templateIds[i], {
				order: i + 1,
				updatedAt: Date.now(),
			});
		}
	},
});
