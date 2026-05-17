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

// ── Application tables ──
//
// Identity, organizations, members, invitations and billing live on the
// `@sferadev/platform` service — photocall does not manage any of those tables
// itself. The columns below that look like foreign keys (organizationId,
// userId) are intentionally plain text/UUID references with no FK constraint;
// they hold IDs minted by the platform.

export const events = pgTable(
	"events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: text("organization_id").notNull(),
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
		organizationId: text("organization_id").notNull(),
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

/**
 * Per-org photocall-specific settings (logo, branding, etc.). Keyed by the
 * platform organization id. Photocall stores no other org-level data.
 */
export const orgSettings = pgTable("org_settings", {
	organizationId: text("organization_id").primaryKey(),
	logoStorageKey: text("logo_storage_key"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
