import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		language: v.string(),
	},
	handler: async (ctx, args) => {
		const sessionId = await ctx.db.insert("sessions", {
			status: "started",
			language: args.language,
			startedAt: Date.now(),
		});
		return sessionId;
	},
});

export const selectTemplate = mutation({
	args: {
		sessionId: v.id("sessions"),
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.sessionId, {
			status: "template_selected",
			templateId: args.templateId,
		});
	},
});

export const saveCapture = mutation({
	args: {
		sessionId: v.id("sessions"),
		capturedImageUrl: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.sessionId, {
			status: "captured",
			capturedImageUrl: args.capturedImageUrl,
		});
	},
});

export const personalize = mutation({
	args: {
		sessionId: v.id("sessions"),
		caption: v.optional(v.string()),
		mirrored: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.sessionId, {
			status: "personalized",
			caption: args.caption,
			mirrored: args.mirrored,
		});
	},
});

export const complete = mutation({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.sessionId, {
			status: "completed",
			completedAt: Date.now(),
		});
	},
});

export const abandon = mutation({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (session && session.status !== "completed") {
			await ctx.db.patch(args.sessionId, {
				status: "abandoned",
			});
		}
	},
});

export const get = query({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.sessionId);
	},
});

export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const sessions = await ctx.db.query("sessions").collect();
		const completed = sessions.filter((s) => s.status === "completed").length;
		const abandoned = sessions.filter((s) => s.status === "abandoned").length;
		const inProgress = sessions.filter(
			(s) => !["completed", "abandoned"].includes(s.status),
		).length;

		return {
			total: sessions.length,
			completed,
			abandoned,
			inProgress,
			completionRate: sessions.length > 0 ? completed / sessions.length : 0,
		};
	},
});
