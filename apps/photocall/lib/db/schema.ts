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
import type { FilterKind } from "@/lib/layout/types";

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
		// Selected capture device (USB webcam, etc.); null falls back to defaultCamera facingMode.
		cameraDeviceId: text("camera_device_id"),
		cameraDeviceLabel: text("camera_device_label"),
		// Photo settings
		photoQuality: real("photo_quality").notNull().default(0.9),
		maxPhotoDimension: integer("max_photo_dimension").notNull().default(1920),
		// Branding
		primaryColor: text("primary_color"),
		logoStorageKey: text("logo_storage_key"),
		welcomeMessage: text("welcome_message"),
		thankYouMessage: text("thank_you_message"),
		// Kiosk chrome overrides (admin-editable). When null/empty the kiosk falls
		// back to the existing i18n default text — these are data, not a replacement
		// for i18n.
		attractTitle: text("attract_title"),
		attractSubtitle: text("attract_subtitle"),
		ctaLabel: text("cta_label"),
		consentText: text("consent_text"),
		accentColor: text("accent_color"),
		// Display font for kiosk headings, chosen from BUNDLED_FONTS (lib/compose/fonts.ts).
		fontFamily: text("font_family"),
		showPoweredBy: boolean("show_powered_by").notNull().default(true),
		// Share settings
		shareExpirationDays: integer("share_expiration_days"),
		allowDownload: boolean("allow_download").notNull().default(true),
		allowPrint: boolean("allow_print").notNull().default(true),
		showQrCode: boolean("show_qr_code").notNull().default(true),
		// Retention
		retentionDays: integer("retention_days"),
		deleteAfterDate: timestamp("delete_after_date"),
		// Couple / event personalization (photobooth)
		coupleNames: text("couple_names"),
		// Capture settings (photobooth)
		captureWhoChoosesFilter: text("capture_who_chooses_filter").notNull().default("guest"), // guest | host
		captureDefaultCountdown: integer("capture_default_countdown").notNull().default(3),
		captureAutoShoot: boolean("capture_auto_shoot").notNull().default(false),
		// Boomerang/GIF capture mode (guest-selectable when enabled).
		boomerangEnabled: boolean("boomerang_enabled").notNull().default(false),
		// Print settings (photobooth)
		printMethod: text("print_method").notNull().default("none"), // none | bridge | manual
		printPrinterId: text("print_printer_id"),
		printPaperSize: text("print_paper_size"),
		printMediaType: text("print_media_type").notNull().default("photo_glossy"),
		printBorderless: boolean("print_borderless").notNull().default(true),
		printCopies: integer("print_copies").notNull().default(1),
		printOrientation: text("print_orientation").notNull().default("portrait"), // portrait | landscape
		printAutoPrint: boolean("print_auto_print").notNull().default(false),
		printBridgeUrl: text("print_bridge_url"),
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
		// Multi-shot photobooth captures (JSON array of image URLs)
		capturedImageUrls: text("captured_image_urls"),
		shotIndex: integer("shot_index").notNull().default(0),
		selectedFilter: text("selected_filter"),
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
		// Photobooth: "single", "strip" (composited multi-shot) or "boomerang"
		// (animated GIF). Stored as free text — no DB-level enum constraint.
		kind: text("kind").notNull().default("single"),
		// Raw individual shots backing a composited strip (JSON array of URLs)
		rawShotsJson: text("raw_shots_json"),
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
		// Photobooth layout (BoothLayout JSON) and metadata
		layoutJson: text("layout_json"), // JSON string
		kind: text("kind").notNull().default("single"),
		shotCount: integer("shot_count").notNull().default(1),
		presetId: text("preset_id"),
		allowedFilters: text("allowed_filters"), // JSON string: FilterKind[]
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [index("templates_event_idx").on(t.eventId)],
);

/**
 * Built-in and custom photobooth presets. A preset is a reusable `BoothLayout`
 * (stored as JSON) with display metadata; events instantiate templates from
 * these. Keyed by a stable string id (e.g. "strip_3bw_vertical").
 */
export const presets = pgTable("presets", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	kind: text("kind").notNull(),
	shotCount: integer("shot_count").notNull(),
	layoutJson: text("layout_json").notNull(), // JSON string: BoothLayout
	thumbnailStorageKey: text("thumbnail_storage_key"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

/**
 * What a stored photo represents:
 * - `single`: a legacy single-photo capture (optionally composited with a template)
 * - `strip`: a composited multi-shot photobooth strip
 * - `boomerang`: an animated GIF boomerang loop
 */
export type PhotoKind = "single" | "strip" | "boomerang";

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

// ── Photobooth parse helpers ──

export { parseLayoutJson } from "@/lib/layout/parse";

/** Parse the stored `allowed_filters` JSON into a `FilterKind` array. */
export function parseAllowedFilters(json: string | null): FilterKind[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as FilterKind[]) : [];
	} catch {
		return [];
	}
}

/** Parse a stored JSON array of captured image URLs. */
export function parseCapturedImageUrls(json: string | null): string[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as string[]) : [];
	} catch {
		return [];
	}
}

/** Parse a stored JSON array of raw shot URLs backing a composited strip. */
export function parseRawShotsJson(json: string | null): string[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as string[]) : [];
	} catch {
		return [];
	}
}
