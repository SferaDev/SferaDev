"use server";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { generateHumanCode, generateToken, requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { type PhotoKind, parseRawShotKeys } from "@/lib/db/schema";
import { getPlatformClient } from "@/lib/platform";
import { daysUntilPurge } from "@/lib/recycle-bin";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

/**
 * Reads an optional `language` value off the event row. The events table does
 * not (yet) have a `language` column — the main agent owns the schema and will
 * add `events.language` plus a settings selector. Until then this safely returns
 * `null` so the share page falls back to its default locale behaviour. Written
 * defensively (no cast of the whole row) so it keeps working once the column is
 * added and starts returning a real value.
 */
function readEventLanguage(event: Record<string, unknown>): string | null {
	const value = event.language;
	return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Image MIME types the kiosk uploads. Composited photos/strips are JPEG;
 * boomerangs are animated GIFs. The content type also drives the stored
 * object's extension (`.jpeg` / `.gif`) and presigned PUT `Content-Type`.
 */
export type PhotoContentType = "image/jpeg" | "image/gif";

export async function generatePhotoUploadUrl(
	eventId: string,
	contentType: PhotoContentType = "image/jpeg",
) {
	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.id, eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (event?.status !== "active") {
		throw new Error("Event not found or not active");
	}

	return await generateUploadUrl("photos", contentType);
}

export async function createPhoto(data: {
	eventId: string;
	sessionId: string;
	/** The unprocessed ORIGINAL — the preview image everywhere. */
	storageKey: string;
	/**
	 * The decorated/processed composite, used for printing and offered as a
	 * separate "print version" download. Omitted for boomerangs and legacy rows.
	 */
	printStorageKey?: string;
	/** JSON array of the individual raw shot storage KEYS (not URLs/base64). */
	rawShotKeys?: string;
	caption?: string;
	templateId?: string;
	width: number;
	height: number;
	sizeBytes: number;
	/** Photobooth: "single", composited "strip", or "boomerang" GIF. */
	kind?: PhotoKind;
	/** JSON array of raw shot URLs backing a composited strip. */
	rawShotsJson?: string;
}) {
	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.id, data.eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (event?.status !== "active") {
		throw new Error("Event not found or not active");
	}

	// Capture-photo entitlement check is delegated to the platform. The
	// product never enforces local quotas; if `capture_photo` is enabled the
	// kiosk may always capture, and metered overages are reported below.
	const platform = getPlatformClient();
	const allowed = await platform.can(event.organizationId, "capture_photo");
	if (!allowed) {
		throw new Error("Photo capture is not enabled for this plan.");
	}

	const shareToken = generateToken(16);
	const humanCode = generateHumanCode();
	const now = new Date();

	const [photo] = await db
		.insert(schema.photos)
		.values({
			eventId: data.eventId,
			sessionId: data.sessionId,
			storageKey: data.storageKey,
			printStorageKey: data.printStorageKey,
			rawShotKeys: data.rawShotKeys,
			shareToken,
			humanCode,
			caption: data.caption,
			templateId: data.templateId,
			kind: data.kind ?? "single",
			rawShotsJson: data.rawShotsJson,
			width: data.width,
			height: data.height,
			sizeBytes: data.sizeBytes,
			expiresAt: event.shareExpirationDays
				? new Date(now.getTime() + event.shareExpirationDays * 24 * 60 * 60 * 1000)
				: null,
			createdAt: now,
		})
		.returning({ id: schema.photos.id });

	// Update event stats
	await db
		.update(schema.events)
		.set({
			photoCount: event.photoCount + 1,
			updatedAt: now,
		})
		.where(eq(schema.events.id, data.eventId));

	// Log usage locally for analytics.
	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId: data.eventId,
		type: "photo_captured",
		bytes: data.sizeBytes,
		createdAt: now,
	});

	// Report usage to the platform for metered billing. Fire and forget —
	// don't surface a metering error after the photo is already persisted.
	platform.reportUsage(event.organizationId, "photos_captured", 1).catch((err: unknown) => {
		console.error("platform.reportUsage failed:", err);
	});

	return { photoId: photo.id, shareToken, humanCode };
}

export async function getPhotoByShareToken(shareToken: string) {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.shareToken, shareToken), isNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);

	if (!photo) return null;

	if (photo.expiresAt && photo.expiresAt < new Date()) {
		return null;
	}

	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.id, photo.eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (!event) return null;

	// The preview/main image is always the unprocessed ORIGINAL (storageKey).
	const url = await getFileUrl(photo.storageKey);
	// The decorated/processed composite, downloadable as the "print version".
	// Null for boomerangs and legacy rows that predate the split.
	const printUrl = photo.printStorageKey ? await getFileUrl(photo.printStorageKey) : null;
	const rawShotKeys = parseRawShotKeys(photo.rawShotKeys);
	// Each individual raw shot, resolved so guests can view/download them.
	const rawShotUrls = await Promise.all(rawShotKeys.map((key) => getFileUrl(key)));

	// Download counterparts of the URLs above. These carry a
	// `Content-Disposition: attachment; filename="..."` header so a plain link
	// click downloads the file directly from storage (cross-origin, no CORS).
	// Boomerangs are GIFs; everything else is JPEG.
	const ext = photo.kind === "boomerang" ? "gif" : "jpg";
	const downloadUrl = await getFileUrl(photo.storageKey, {
		downloadFilename: `photocall_${photo.humanCode}.${ext}`,
	});
	const printDownloadUrl = photo.printStorageKey
		? await getFileUrl(photo.printStorageKey, {
				downloadFilename: `photocall_${photo.humanCode}_print.jpg`,
			})
		: null;
	const rawShotDownloadUrls = await Promise.all(
		rawShotKeys.map((key, index) =>
			getFileUrl(key, { downloadFilename: `photocall_${photo.humanCode}_${index + 1}.jpg` }),
		),
	);

	// Event branding so the public share page can present the event's identity
	// (name, logo, colours) instead of generic Photocall chrome.
	const logoUrl = event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null;

	return {
		...photo,
		url,
		printUrl,
		rawShotUrls,
		downloadUrl,
		printDownloadUrl,
		rawShotDownloadUrls,
		eventName: event.name,
		allowDownload: event.allowDownload,
		allowPrint: event.allowPrint,
		showQrCode: event.showQrCode,
		// Branding
		primaryColor: event.primaryColor,
		accentColor: event.accentColor,
		logoUrl,
		// Event language drives the share page's locale. `null` until the schema
		// gains an `events.language` column (see readEventLanguage).
		language: readEventLanguage(event),
	};
}

export async function getPhotoByHumanCode(humanCode: string) {
	const photo = await db
		.select({ shareToken: schema.photos.shareToken, expiresAt: schema.photos.expiresAt })
		.from(schema.photos)
		.where(
			and(eq(schema.photos.humanCode, humanCode.toUpperCase()), isNull(schema.photos.deletedAt)),
		)
		.then((rows) => rows[0]);

	if (!photo) return null;

	if (photo.expiresAt && photo.expiresAt < new Date()) {
		return null;
	}

	return { shareToken: photo.shareToken };
}

export async function listPhotos(eventId: string, limit?: number) {
	await requireEventAccess(eventId);

	const take = limit ?? 20;

	const photos = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.eventId, eventId), isNull(schema.photos.deletedAt)))
		.orderBy(desc(schema.photos.createdAt))
		.limit(take + 1);

	const hasMore = photos.length > take;
	const items = hasMore ? photos.slice(0, take) : photos;

	const photosWithUrls = await Promise.all(
		items.map(async (photo) => {
			const url = await getFileUrl(photo.storageKey);
			return { ...photo, url };
		}),
	);

	return {
		items: photosWithUrls,
		hasMore,
		nextCursor: hasMore ? items[items.length - 1].id : undefined,
	};
}

export async function listRecentPublicPhotos(eventId: string, limit?: number) {
	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.id, eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (event?.status !== "active") {
		return [];
	}

	const take = limit ?? 10;

	const photos = await db
		.select({
			id: schema.photos.id,
			storageKey: schema.photos.storageKey,
			rawShotKeys: schema.photos.rawShotKeys,
			humanCode: schema.photos.humanCode,
			createdAt: schema.photos.createdAt,
		})
		.from(schema.photos)
		.where(and(eq(schema.photos.eventId, eventId), isNull(schema.photos.deletedAt)))
		.orderBy(desc(schema.photos.createdAt))
		.limit(take);

	// The attract showcase looks best with the RAW, uncropped captures rather than
	// the template composite — a strip's "clean" image still crops each photo into
	// its slot. For captures that kept their individual shots, surface each raw shot
	// as its own tile; otherwise fall back to the stored preview image (a single
	// capture is already the raw frame; a boomerang is its GIF).
	const tiles = await Promise.all(
		photos.map(async (photo) => {
			const rawKeys = parseRawShotKeys(photo.rawShotKeys);
			const keys = rawKeys.length > 0 ? rawKeys : [photo.storageKey];
			return Promise.all(
				keys.map(async (key, index) => ({
					id: rawKeys.length > 0 ? `${photo.id}-${index}` : photo.id,
					url: await getFileUrl(key),
					humanCode: photo.humanCode,
					createdAt: photo.createdAt,
				})),
			);
		}),
	);

	return tiles.flat();
}

/**
 * Soft-deletes a photo: stamps `deletedAt` so it moves to the recycling bin and
 * disappears from every gallery/album/share. The R2 object and the row survive
 * until the cleanup cron purges items older than RECYCLE_BIN_RETENTION_DAYS (or
 * a host calls {@link purgePhotoNow}). The denormalized photoCount drops now so
 * stats match what's visible; {@link restorePhoto} re-increments it.
 */
export async function deletePhoto(photoId: string) {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.id, photoId), isNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);

	if (!photo) return;

	const { event } = await requireEventAccess(photo.eventId, ["owner", "admin"]);

	const now = new Date();
	await db.update(schema.photos).set({ deletedAt: now }).where(eq(schema.photos.id, photoId));

	// Only visible photos count toward the event total; pending/hidden guest
	// uploads were never tallied, so don't double-subtract them.
	if (photo.status === "visible") {
		await db
			.update(schema.events)
			.set({
				photoCount: Math.max(0, event.photoCount - 1),
				updatedAt: now,
			})
			.where(eq(schema.events.id, photo.eventId));
	}
}

/** Soft-deletes every (not-already-deleted) photo in an event. */
export async function deleteAllPhotos(eventId: string) {
	await requireEventAccess(eventId, ["owner", "admin"]);

	const now = new Date();
	const deleted = await db
		.update(schema.photos)
		.set({ deletedAt: now })
		.where(and(eq(schema.photos.eventId, eventId), isNull(schema.photos.deletedAt)))
		.returning({ id: schema.photos.id });

	await db
		.update(schema.events)
		.set({
			photoCount: 0,
			updatedAt: now,
		})
		.where(eq(schema.events.id, eventId));

	return { deleted: deleted.length };
}

// ── Recycling bin ────────────────────────────────────────────────────────────

export type DeletedPhoto = {
	id: string;
	url: string;
	humanCode: string;
	source: string;
	kind: string;
	deletedAt: Date;
	/** Whole days left before the cron permanently purges this photo. */
	daysUntilPurge: number;
};

/** Soft-deleted photos for an event, newest deletions first (recycling bin). */
export async function listDeletedPhotos(eventId: string): Promise<DeletedPhoto[]> {
	await requireEventAccess(eventId, ["owner", "admin"]);

	const rows = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.eventId, eventId), isNotNull(schema.photos.deletedAt)))
		.orderBy(desc(schema.photos.deletedAt));

	return Promise.all(
		rows
			.filter((photo): photo is typeof photo & { deletedAt: Date } => photo.deletedAt !== null)
			.map(async (photo) => ({
				id: photo.id,
				url: await getFileUrl(photo.storageKey),
				humanCode: photo.humanCode,
				source: photo.source,
				kind: photo.kind,
				deletedAt: photo.deletedAt,
				daysUntilPurge: daysUntilPurge(photo.deletedAt),
			})),
	);
}

/** Restores a soft-deleted photo (clears `deletedAt`) back into the event. */
export async function restorePhoto(photoId: string): Promise<{ ok: boolean }> {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.id, photoId), isNotNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);

	if (!photo) return { ok: false };

	const { event } = await requireEventAccess(photo.eventId, ["owner", "admin"]);

	const now = new Date();
	await db.update(schema.photos).set({ deletedAt: null }).where(eq(schema.photos.id, photoId));

	// Mirror the decrement applied at soft-delete time.
	if (photo.status === "visible") {
		await db
			.update(schema.events)
			.set({ photoCount: event.photoCount + 1, updatedAt: now })
			.where(eq(schema.events.id, photo.eventId));
	}

	return { ok: true };
}

/**
 * Permanently removes a soft-deleted photo now, skipping the retention wait:
 * deletes the R2 object and the row, and records the storage as freed. Only
 * operates on photos already in the recycling bin.
 */
export async function purgePhotoNow(photoId: string): Promise<{ ok: boolean }> {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.id, photoId), isNotNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);

	if (!photo) return { ok: false };

	const { event } = await requireEventAccess(photo.eventId, ["owner", "admin"]);

	// Best-effort R2 delete: a missing object must not block removing the row.
	await deleteFile(photo.storageKey).catch((err: unknown) => {
		console.error("purgePhotoNow: deleteFile failed:", err);
	});
	await db.delete(schema.photos).where(eq(schema.photos.id, photoId));

	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId: photo.eventId,
		type: "storage_removed",
		bytes: photo.sizeBytes,
		createdAt: new Date(),
	});

	return { ok: true };
}
