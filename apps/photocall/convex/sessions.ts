import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireEventAccess } from "./lib/auth";

// Public mutation for kiosk mode
export const create = mutation({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event || event.status !== "active") {
			throw new Error("Event not found or not active");
		}

		const sessionId = await ctx.db.insert("sessions", {
			eventId: args.eventId,
			status: "started",
			startedAt: Date.now(),
		});

		// Update event session count
		await ctx.db.patch(args.eventId, {
			sessionCount: event.sessionCount + 1,
			updatedAt: Date.now(),
		});

		return sessionId;
	},
});

// Public mutation for kiosk mode
export const selectTemplate = mutation({
	args: {
		sessionId: v.id("sessions"),
		templateId: v.id("templates"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		await ctx.db.patch(args.sessionId, {
			status: "template_selected",
			templateId: args.templateId,
		});
	},
});

// Public mutation for kiosk mode
export const saveCapture = mutation({
	args: {
		sessionId: v.id("sessions"),
		capturedImageUrl: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		await ctx.db.patch(args.sessionId, {
			status: "captured",
			capturedImageUrl: args.capturedImageUrl,
		});
	},
});

// Public mutation for kiosk mode
export const personalize = mutation({
	args: {
		sessionId: v.id("sessions"),
		caption: v.optional(v.string()),
		mirrored: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		await ctx.db.patch(args.sessionId, {
			status: "personalized",
			caption: args.caption,
			mirrored: args.mirrored,
		});
	},
});

// Public mutation for kiosk mode
export const complete = mutation({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		await ctx.db.patch(args.sessionId, {
			status: "completed",
			completedAt: Date.now(),
		});
	},
});

// Public mutation for kiosk mode
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

// Public query for kiosk mode
export const get = query({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.sessionId);
	},
});

// Authenticated query for admin
export const getStats = query({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

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

// Authenticated query for admin
export const list = query({
	args: {
		eventId: v.id("events"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await requireEventAccess(ctx, userId, args.eventId);

		const limit = args.limit ?? 50;

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.order("desc")
			.take(limit);

		return sessions;
	},
});
