import {
	boolean,
	index,
	integer,
	pgTable,
	real,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

// ── Better Auth tables (managed by better-auth, defined here for relations) ──

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

// ── Application tables ──

export const userProfiles = pgTable(
	"user_profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		name: text("name"),
		avatarUrl: text("avatar_url"),
		onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [uniqueIndex("user_profiles_user_idx").on(t.userId)],
);

export const organizations = pgTable(
	"organizations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		logoStorageKey: text("logo_storage_key"),
		ownerId: text("owner_id")
			.notNull()
			.references(() => user.id),
		// Subscription
		subscriptionTier: text("subscription_tier").notNull().default("free"), // free | paid
		stripeCustomerId: text("stripe_customer_id"),
		stripeSubscriptionId: text("stripe_subscription_id"),
		subscriptionStatus: text("subscription_status").notNull().default("none"), // active | past_due | canceled | trialing | none
		trialEndsAt: timestamp("trial_ends_at"),
		// Limits
		maxEvents: integer("max_events").notNull().default(1),
		maxPhotosPerEvent: integer("max_photos_per_event").notNull().default(10),
		maxStorageBytes: integer("max_storage_bytes").notNull().default(104857600), // 100MB
		maxTeamMembers: integer("max_team_members").notNull().default(1),
		// Usage
		currentStorageBytes: integer("current_storage_bytes").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("organizations_owner_idx").on(t.ownerId),
		uniqueIndex("organizations_stripe_customer_idx").on(t.stripeCustomerId),
	],
);

export const organizationMembers = pgTable(
	"organization_members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		role: text("role").notNull().default("member"), // owner | admin | member
		invitedBy: text("invited_by"),
		invitedAt: timestamp("invited_at"),
		joinedAt: timestamp("joined_at").notNull().defaultNow(),
	},
	(t) => [
		index("org_members_org_idx").on(t.organizationId),
		index("org_members_user_idx").on(t.userId),
		uniqueIndex("org_members_org_user_idx").on(t.organizationId, t.userId),
	],
);

export const invitations = pgTable(
	"invitations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role").notNull().default("member"), // admin | member
		invitedBy: text("invited_by").notNull(),
		token: text("token").notNull().unique(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("invitations_org_idx").on(t.organizationId),
		index("invitations_email_idx").on(t.email),
	],
);

export const events = pgTable(
	"events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		description: text("description"),
		startDate: timestamp("start_date"),
		endDate: timestamp("end_date"),
		status: text("status").notNull().default("draft"), // draft | active | paused | archived
		// Kiosk PIN
		kioskPinHash: text("kiosk_pin_hash"),
		kioskPinSalt: text("kiosk_pin_salt"),
		// Kiosk settings
		slideshowEnabled: boolean("slideshow_enabled").notNull().default(true),
		slideshowSafeMode: boolean("slideshow_safe_mode").notNull().default(false),
		idleTimeoutSeconds: integer("idle_timeout_seconds").notNull().default(120),
		defaultCamera: text("default_camera").notNull().default("user"), // user | environment
		// Photo settings
		photoQuality: real("photo_quality").notNull().default(0.9),
		maxPhotoDimension: integer("max_photo_dimension").notNull().default(1920),
		// Branding
		primaryColor: text("primary_color"),
		logoStorageKey: text("logo_storage_key"),
		welcomeMessage: text("welcome_message"),
		thankYouMessage: text("thank_you_message"),
		// Share settings
		shareExpirationDays: integer("share_expiration_days"),
		allowDownload: boolean("allow_download").notNull().default(true),
		allowPrint: boolean("allow_print").notNull().default(true),
		showQrCode: boolean("show_qr_code").notNull().default(true),
		// Retention
		retentionDays: integer("retention_days"),
		deleteAfterDate: timestamp("delete_after_date"),
		// Stats (denormalized for performance)
		photoCount: integer("photo_count").notNull().default(0),
		sessionCount: integer("session_count").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("events_org_idx").on(t.organizationId),
		uniqueIndex("events_org_slug_idx").on(t.organizationId, t.slug),
		index("events_status_idx").on(t.status),
	],
);

export const kioskSessions = pgTable(
	"kiosk_sessions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("started"), // started | template_selected | captured | personalized | completed | abandoned
		templateId: uuid("template_id"),
		capturedImageUrl: text("captured_image_url"),
		caption: text("caption"),
		mirrored: boolean("mirrored"),
		startedAt: timestamp("started_at").notNull().defaultNow(),
		completedAt: timestamp("completed_at"),
	},
	(t) => [
		index("kiosk_sessions_event_idx").on(t.eventId),
		index("kiosk_sessions_status_idx").on(t.status),
	],
);

export const photos = pgTable(
	"photos",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		sessionId: uuid("session_id")
			.notNull()
			.references(() => kioskSessions.id),
		storageKey: text("storage_key").notNull(),
		shareToken: text("share_token").notNull().unique(),
		humanCode: text("human_code").notNull(),
		caption: text("caption"),
		templateId: uuid("template_id"),
		width: integer("width").notNull(),
		height: integer("height").notNull(),
		sizeBytes: integer("size_bytes").notNull(),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [index("photos_event_idx").on(t.eventId), index("photos_created_at_idx").on(t.createdAt)],
);

export const templates = pgTable(
	"templates",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		storageKey: text("storage_key").notNull(),
		thumbnailStorageKey: text("thumbnail_storage_key"),
		enabled: boolean("enabled").notNull().default(true),
		order: integer("order").notNull().default(0),
		// JSON fields for caption position and safe area
		captionPositionJson: text("caption_position_json"), // JSON string
		safeAreaJson: text("safe_area_json"), // JSON string
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [index("templates_event_idx").on(t.eventId)],
);

export const usageLogs = pgTable(
	"usage_logs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		eventId: uuid("event_id"),
		type: text("type").notNull(), // photo_captured | photo_downloaded | photo_printed | storage_added | storage_removed
		metadata: text("metadata"), // JSON string
		bytes: integer("bytes"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("usage_logs_org_idx").on(t.organizationId),
		index("usage_logs_created_at_idx").on(t.createdAt),
	],
);

export const stripeEvents = pgTable(
	"stripe_events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		stripeEventId: text("stripe_event_id").notNull().unique(),
		type: text("type").notNull(),
		processedAt: timestamp("processed_at").notNull().defaultNow(),
	},
	(t) => [uniqueIndex("stripe_events_stripe_id_idx").on(t.stripeEventId)],
);

// ── Helper types ──

export type CaptionPosition = {
	x: number;
	y: number;
	maxWidth: number;
	fontSize: number;
	color: string;
	align: "left" | "center" | "right";
};

export type SafeArea = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export function parseCaptionPosition(json: string | null): CaptionPosition | null {
	if (!json) return null;
	try {
		return JSON.parse(json) as CaptionPosition;
	} catch {
		return null;
	}
}

export function parseSafeArea(json: string | null): SafeArea | null {
	if (!json) return null;
	try {
		return JSON.parse(json) as SafeArea;
	} catch {
		return null;
	}
}
