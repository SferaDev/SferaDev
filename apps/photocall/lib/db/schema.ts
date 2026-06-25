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
		// Default language for guest-facing surfaces that aren't behind the kiosk's
		// own locale switcher (e.g. the public share page). Null → fall back to the
		// app default. One of the supported locales: en | es | ca.
		language: text("language"),
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
		// Digital zoom applied to the live feed and the captured frame (center crop).
		// 1 = no zoom; higher values crop tighter so guests don't have to stand far
		// back. Applied consistently to the kiosk preview, photo capture and
		// boomerang frames so what's framed is what's captured.
		captureZoom: real("capture_zoom").notNull().default(1),
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
		// Skip the kiosk consent screen entirely (host accepts responsibility for
		// obtaining consent another way). When true, attract goes straight to the
		// template picker.
		skipConsent: boolean("skip_consent").notNull().default(false),
		accentColor: text("accent_color"),
		// Display font for kiosk headings, chosen from BUNDLED_FONTS (lib/compose/fonts.ts).
		fontFamily: text("font_family"),
		showPoweredBy: boolean("show_powered_by").notNull().default(true),
		// Share settings
		shareExpirationDays: integer("share_expiration_days"),
		allowDownload: boolean("allow_download").notNull().default(true),
		allowPrint: boolean("allow_print").notNull().default(true),
		showQrCode: boolean("show_qr_code").notNull().default(true),
		// Guest album — a public, per-event gallery guests reach by URL/QR where
		// they can view photobooth photos and contribute their own. Disabled by
		// default; the host turns it on from event settings.
		albumEnabled: boolean("album_enabled").notNull().default(false),
		// CSPRNG token that addresses the album at /a/[albumToken]. Unguessable and
		// rotatable (regenerating revokes previously shared links).
		albumToken: text("album_token").unique(),
		// How guests gain access: "link" (anyone with the URL), "link_pin" (URL +
		// shared PIN), "link_identity" (URL + a name before entering).
		albumAccessMode: text("album_access_mode").notNull().default("link"), // link | link_pin | link_identity
		// Optional album PIN (used when albumAccessMode = "link_pin"). Hashed like
		// the kiosk PIN — never stored in plaintext.
		albumPinHash: text("album_pin_hash"),
		albumPinSalt: text("album_pin_salt"),
		// Whether guests may upload their own photos to the album.
		allowGuestUpload: boolean("allow_guest_upload").notNull().default(true),
		// Moderation policy for guest uploads: "instant" (visible immediately) or
		// "approval" (held as `pending` until a host approves).
		albumModeration: text("album_moderation").notNull().default("instant"), // instant | approval
		// Retention
		retentionDays: integer("retention_days"),
		deleteAfterDate: timestamp("delete_after_date"),
		// Couple / event personalization (photobooth)
		coupleNames: text("couple_names"),
		// Capture settings (photobooth)
		captureWhoChoosesFilter: text("capture_who_chooses_filter").notNull().default("guest"), // guest | host
		captureDefaultCountdown: integer("capture_default_countdown").notNull().default(3),
		captureAutoShoot: boolean("capture_auto_shoot").notNull().default(false),
		// Begin the first shot's countdown automatically once the camera is ready,
		// so guests don't have to press the shutter to start. Subsequent shots in a
		// strip still wait for a tap unless captureAutoShoot is also on.
		captureAutoStart: boolean("capture_auto_start").notNull().default(true),
		// Mirror (horizontally flip) the final photo. Moved from a per-guest toggle
		// to a host setting so every photo at the booth looks consistent. Defaults
		// on to match the familiar selfie/front-camera preview.
		mirrorPhotos: boolean("mirror_photos").notNull().default(true),
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
		// CSPRNG token the on-site print bridge authenticates with when it polls
		// this server for jobs (cloud-pull printing — the bridge reaches out, the
		// HTTPS kiosk never talks to the LAN bridge directly). Null until the event
		// is paired with a bridge; rotatable to revoke a bridge's access.
		bridgePairingToken: text("bridge_pairing_token").unique(),
		// Stats (denormalized for performance)
		photoCount: integer("photo_count").notNull().default(0),
		sessionCount: integer("session_count").notNull().default(0),
		// Soft delete: when set, the event is in the recycling bin and hidden from
		// all normal listings. The cleanup cron permanently removes events (and
		// their photos' R2 objects) once `deletedAt` is older than
		// RECYCLE_BIN_RETENTION_DAYS.
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("events_org_idx").on(t.organizationId),
		uniqueIndex("events_org_slug_idx").on(t.organizationId, t.slug),
		index("events_status_idx").on(t.status),
		index("events_deleted_at_idx").on(t.deletedAt),
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
		// Nullable: kiosk captures belong to a kiosk session, but guest-album
		// uploads have no session (source = "guest").
		sessionId: uuid("session_id").references(() => kioskSessions.id),
		// Where the photo came from: "kiosk" (photobooth capture) or "guest"
		// (uploaded by an attendee through the guest album).
		source: text("source").notNull().default("kiosk"), // kiosk | guest
		// For guest uploads: the anonymous guest identifier (from the signed album
		// cookie) and their optional display name. Lets a guest manage their own
		// uploads and lets the album attribute contributions.
		uploaderId: text("uploader_id"),
		uploaderName: text("uploader_name"),
		// Moderation state. Kiosk photos are always "visible"; guest uploads may be
		// "pending" (awaiting host approval) or "hidden" (removed by a host).
		status: text("status").notNull().default("visible"), // visible | pending | hidden
		// The unprocessed ORIGINAL — used as the preview image everywhere (gallery,
		// album, share). Single = the raw capture; strip = a CLEAN composite (photos
		// in their slots, no graphic/text overlays); boomerang = the GIF.
		storageKey: text("storage_key").notNull(),
		// The decorated/processed composite (all graphic + text layers), used ONLY
		// for printing and offered as a separate "print version" download. Null for
		// boomerangs and legacy rows (which predate the original/processed split).
		printStorageKey: text("print_storage_key"),
		// The individual raw shots backing a capture, as a JSON array of R2 storage
		// keys (NOT URLs/base64). Lets guests view/download each shot. Null for
		// boomerangs and legacy rows.
		rawShotKeys: text("raw_shot_keys"),
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
		// Soft delete: when set, the photo is in the recycling bin — hidden from
		// galleries, albums and share lookups but still recoverable. The cleanup
		// cron deletes the R2 object and the row once `deletedAt` is older than
		// RECYCLE_BIN_RETENTION_DAYS.
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("photos_event_idx").on(t.eventId),
		index("photos_created_at_idx").on(t.createdAt),
		// Guest-album queries filter by event + visibility, and a guest manages
		// their own uploads by uploaderId.
		index("photos_event_status_idx").on(t.eventId, t.status),
		index("photos_uploader_idx").on(t.uploaderId),
		index("photos_deleted_at_idx").on(t.deletedAt),
	],
);

/**
 * Print jobs the kiosk enqueues server-side for the on-site print bridge to
 * pull. A venue's HTTPS kiosk can't reach a LAN bridge directly (mixed
 * content), so jobs land here; the bridge polls this server outbound, claims
 * queued rows, downloads the print-ready image via a presigned R2 GET (bytes
 * never pass through the DB), prints and reports status back.
 */
export const printJobs = pgTable(
	"print_jobs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		// The originating photo, if any. Nullable so a job survives the photo being
		// deleted (and to allow ad-hoc/test prints that aren't tied to a photo).
		photoId: uuid("photo_id").references(() => photos.id, { onDelete: "set null" }),
		// R2 key of the PRINT-READY image. The bridge downloads the bytes via a
		// presigned GET — the image itself never passes through the database.
		imageStorageKey: text("image_storage_key").notNull(),
		// Bridge-side printer id (e.g. "debug" or a discovered IPP printer id).
		printerId: text("printer_id").notNull(),
		// Print parameters, snapshotted at enqueue time from the event settings.
		paperSize: text("paper_size").notNull(),
		mediaType: text("media_type"),
		borderless: boolean("borderless").notNull().default(true),
		copies: integer("copies").notNull().default(1),
		orientation: text("orientation").notNull().default("portrait"), // portrait | landscape
		// Lifecycle of the job as it moves through the bridge. Plain text (no DB-level
		// enum/CHECK), narrowed by the PrintJobStatus union below.
		status: text("status").notNull().default("queued"), // queued | claimed | printing | done | failed | canceled
		attempts: integer("attempts").notNull().default(0),
		lastError: text("last_error"),
		// Bridge coordination: who claimed the job and when, so stale claims from a
		// crashed bridge can be re-queued and never strand a job mid-print.
		claimedAt: timestamp("claimed_at"),
		claimedBy: text("claimed_by"), // bridge instance id
		printedAt: timestamp("printed_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("print_jobs_event_idx").on(t.eventId),
		// The bridge claims by (event, status='queued'); the dashboard lists by
		// (event, status). One composite index serves both.
		index("print_jobs_event_status_idx").on(t.eventId, t.status),
	],
);

/**
 * Printers the on-site bridge has discovered, heartbeated here so the dashboard
 * can list an event's printers (state, media, marker/ink levels) without any
 * direct access to the LAN bridge. The bridge upserts each printer it sees,
 * keyed by (eventId, printerId).
 */
export const bridgePrinters = pgTable(
	"bridge_printers",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		printerId: text("printer_id").notNull(),
		name: text("name").notNull(),
		makeAndModel: text("make_and_model"),
		state: text("state"),
		stateReasons: text("state_reasons"), // JSON string[]
		markerLevels: text("marker_levels"), // JSON number[]
		mediaSupported: text("media_supported"), // JSON string[]
		reachable: boolean("reachable").notNull().default(true),
		lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
	},
	(t) => [uniqueIndex("bridge_printers_event_printer_idx").on(t.eventId, t.printerId)],
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

/** Where a stored photo originated. */
export type PhotoSource = "kiosk" | "guest";

/** Moderation state of a photo in the guest album. */
export type PhotoStatus = "visible" | "pending" | "hidden";

/** How guests gain access to an event's album. */
export type AlbumAccessMode = "link" | "link_pin" | "link_identity";

/** Moderation policy applied to guest uploads. */
export type AlbumModeration = "instant" | "approval";

/**
 * Lifecycle of a {@link printJobs} row as it moves through the bridge:
 * - `queued`: waiting to be claimed
 * - `claimed`: a bridge has reserved it and is about to print
 * - `printing`: actively sent to the printer
 * - `done`: printed successfully
 * - `failed`: printing failed (see `lastError`)
 * - `canceled`: a host canceled the job before it finished (terminal). For an
 *   in-flight job this is best-effort — a page already sent to the printer can't
 *   be recalled — but it stops further attempts/retries and the bridge untracks
 *   it on its next heartbeat (the status route's guard rejects it with a 409).
 */
export type PrintJobStatus = "queued" | "claimed" | "printing" | "done" | "failed" | "canceled";

/** Statuses a print job can still be canceled from (non-terminal). */
export const CANCELABLE_PRINT_JOB_STATUSES = ["queued", "claimed", "printing"] as const;

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

/**
 * Parse the stored `raw_shot_keys` JSON into an array of R2 storage keys. Unlike
 * {@link parseRawShotsJson} (legacy, which held URLs), these are storage keys
 * the consumer resolves to URLs via `getFileUrl` when needed.
 */
export function parseRawShotKeys(json: string | null): string[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as string[]) : [];
	} catch {
		return [];
	}
}
