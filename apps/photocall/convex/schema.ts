import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,

	// Extended user profile
	userProfiles: defineTable({
		userId: v.id("users"),
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		onboardingCompleted: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_user", ["userId"]),

	// Organizations (companies/teams)
	organizations: defineTable({
		name: v.string(),
		slug: v.string(),
		logoStorageId: v.optional(v.id("_storage")),
		ownerId: v.id("users"),
		// Subscription
		subscriptionTier: v.union(
			v.literal("free"),
			v.literal("starter"),
			v.literal("pro"),
			v.literal("enterprise"),
		),
		stripeCustomerId: v.optional(v.string()),
		stripeSubscriptionId: v.optional(v.string()),
		subscriptionStatus: v.union(
			v.literal("active"),
			v.literal("past_due"),
			v.literal("canceled"),
			v.literal("trialing"),
			v.literal("none"),
		),
		trialEndsAt: v.optional(v.number()),
		// Limits
		maxEvents: v.number(),
		maxPhotosPerEvent: v.number(),
		maxStorageBytes: v.number(),
		maxTeamMembers: v.number(),
		// Usage
		currentStorageBytes: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_owner", ["ownerId"])
		.index("by_stripe_customer", ["stripeCustomerId"]),

	// Organization memberships
	organizationMembers: defineTable({
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		invitedBy: v.optional(v.id("users")),
		invitedAt: v.optional(v.number()),
		joinedAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_user", ["userId"])
		.index("by_org_user", ["organizationId", "userId"]),

	// Pending invitations
	invitations: defineTable({
		organizationId: v.id("organizations"),
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
		invitedBy: v.id("users"),
		token: v.string(),
		expiresAt: v.number(),
		createdAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_email", ["email"])
		.index("by_token", ["token"]),

	// Events (photo booth instances)
	events: defineTable({
		organizationId: v.id("organizations"),
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		// Event dates
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		// Status
		status: v.union(
			v.literal("draft"),
			v.literal("active"),
			v.literal("paused"),
			v.literal("archived"),
		),
		// Kiosk PIN (optional, for on-site admin access)
		kioskPinHash: v.optional(v.string()),
		kioskPinSalt: v.optional(v.string()),
		// Kiosk settings
		slideshowEnabled: v.boolean(),
		slideshowSafeMode: v.boolean(),
		idleTimeoutSeconds: v.number(),
		defaultCamera: v.union(v.literal("user"), v.literal("environment")),
		// Photo settings
		photoQuality: v.number(),
		maxPhotoDimension: v.number(),
		// Branding
		primaryColor: v.optional(v.string()),
		logoStorageId: v.optional(v.id("_storage")),
		welcomeMessage: v.optional(v.string()),
		thankYouMessage: v.optional(v.string()),
		// Share settings
		shareExpirationDays: v.optional(v.number()),
		allowDownload: v.boolean(),
		allowPrint: v.boolean(),
		showQrCode: v.boolean(),
		// Retention
		retentionDays: v.optional(v.number()),
		deleteAfterDate: v.optional(v.number()),
		// Stats
		photoCount: v.number(),
		sessionCount: v.number(),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_org_slug", ["organizationId", "slug"])
		.index("by_status", ["status"]),

	// Kiosk sessions for tracking guest flow
	sessions: defineTable({
		eventId: v.id("events"),
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
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
	})
		.index("by_event", ["eventId"])
		.index("by_status", ["status"]),

	// Final rendered photos
	photos: defineTable({
		eventId: v.id("events"),
		sessionId: v.id("sessions"),
		storageId: v.id("_storage"),
		shareToken: v.string(),
		humanCode: v.string(),
		caption: v.optional(v.string()),
		templateId: v.optional(v.id("templates")),
		width: v.number(),
		height: v.number(),
		sizeBytes: v.number(),
		expiresAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_event", ["eventId"])
		.index("by_share_token", ["shareToken"])
		.index("by_human_code", ["humanCode"])
		.index("by_created_at", ["createdAt"]),

	// Template overlays (per event)
	templates: defineTable({
		eventId: v.id("events"),
		name: v.string(),
		storageId: v.id("_storage"),
		thumbnailStorageId: v.optional(v.id("_storage")),
		enabled: v.boolean(),
		order: v.number(),
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
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_event", ["eventId"])
		.index("by_event_enabled_order", ["eventId", "enabled", "order"]),

	// Usage logs for billing
	usageLogs: defineTable({
		organizationId: v.id("organizations"),
		eventId: v.optional(v.id("events")),
		type: v.union(
			v.literal("photo_captured"),
			v.literal("photo_downloaded"),
			v.literal("photo_printed"),
			v.literal("storage_added"),
			v.literal("storage_removed"),
		),
		metadata: v.optional(v.any()),
		bytes: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_event", ["eventId"])
		.index("by_created_at", ["createdAt"]),

	// Stripe webhook events (for idempotency)
	stripeEvents: defineTable({
		stripeEventId: v.string(),
		type: v.string(),
		processedAt: v.number(),
	}).index("by_stripe_event", ["stripeEventId"]),
});
