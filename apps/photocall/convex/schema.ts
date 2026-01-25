import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Kiosk sessions for tracking guest flow
	sessions: defineTable({
		status: v.union(
			v.literal("started"),
			v.literal("template_selected"),
			v.literal("captured"),
			v.literal("personalized"),
			v.literal("completed"),
			v.literal("abandoned"),
		),
		templateId: v.optional(v.id("templates")),
		capturedImageUrl: v.optional(v.string()),
		caption: v.optional(v.string()),
		mirrored: v.optional(v.boolean()),
		language: v.string(),
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
	}).index("by_status", ["status"]),

	// Final rendered photos
	photos: defineTable({
		sessionId: v.id("sessions"),
		storageId: v.id("_storage"),
		shareToken: v.string(),
		humanCode: v.string(), // e.g., "ABCD-1234"
		caption: v.optional(v.string()),
		templateId: v.optional(v.id("templates")),
		width: v.number(),
		height: v.number(),
		expiresAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_share_token", ["shareToken"])
		.index("by_human_code", ["humanCode"])
		.index("by_created_at", ["createdAt"]),

	// Template overlays
	templates: defineTable({
		name: v.string(),
		storageId: v.id("_storage"),
		thumbnailStorageId: v.optional(v.id("_storage")),
		enabled: v.boolean(),
		order: v.number(),
		// Metadata for compositing
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
		// Safe area where photo should be placed (relative coordinates 0-1)
		safeArea: v.optional(
			v.object({
				x: v.number(),
				y: v.number(),
				width: v.number(),
				height: v.number(),
			}),
		),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_enabled_order", ["enabled", "order"]),

	// Global settings (singleton pattern - only one document)
	settings: defineTable({
		// Admin auth
		adminPinHash: v.string(),
		adminPinSalt: v.string(),

		// Kiosk behavior
		slideshowEnabled: v.boolean(),
		slideshowSafeMode: v.boolean(), // blur thumbnails in slideshow
		idleTimeoutSeconds: v.number(),
		defaultCamera: v.union(v.literal("user"), v.literal("environment")),
		language: v.union(v.literal("en"), v.literal("es"), v.literal("cat")),

		// Photo settings
		photoQuality: v.number(), // JPEG quality 0-1
		maxPhotoDimension: v.number(), // max pixels on long edge

		// Retention
		retentionDays: v.optional(v.number()), // auto-delete after N days, null = manual only
		deleteAfterDate: v.optional(v.number()), // timestamp to delete all photos

		// Share settings
		shareExpirationDays: v.optional(v.number()), // links expire after N days

		updatedAt: v.number(),
	}),
});
