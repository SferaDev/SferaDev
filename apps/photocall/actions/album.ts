"use server";

import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import {
	generateHumanCode,
	generateToken,
	hashPin,
	requireEventAccess,
	verifyPin,
} from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import type { AlbumAccessMode, AlbumModeration } from "@/lib/db/schema";
import {
	type AlbumGrant,
	ensureGuestCookie,
	findGrant,
	type GuestUploadContentType,
	isAllowedUploadType,
	MAX_GUEST_UPLOAD_BYTES,
	readGuestCookie,
	upsertGrant,
	writeGuestCookie,
} from "@/lib/guest-album";
import { getPlatformClient } from "@/lib/platform";
import {
	deleteFile,
	getFileUrl,
	getObjectSize,
	generateGuestUploadUrl as presignGuestUpload,
} from "@/lib/storage";

// Per-guest upload limits. A DB-backed throttle (no external store needed):
// guests are anonymous and low-volume, so counting their recent rows is cheap.
const UPLOAD_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_UPLOADS_PER_WINDOW = 30;
const MAX_UPLOADS_PER_GUEST_PER_EVENT = 200;

// ── Public view ──────────────────────────────────────────────────────────

export type AlbumPhoto = {
	id: string;
	url: string;
	/**
	 * Presigned link carrying `Content-Disposition: attachment`, so a plain anchor
	 * click downloads the file directly from storage (cross-origin, no `fetch`, no
	 * CORS). Null when the album disallows downloads.
	 */
	downloadUrl: string | null;
	kind: string;
	caption: string | null;
	source: string;
	uploaderName: string | null;
	status: string;
	createdAt: Date;
	/** True when this guest uploaded the photo (may delete it). */
	mine: boolean;
};

export type AlbumMeta = {
	token: string;
	eventName: string;
	coupleNames: string | null;
	allowDownload: boolean;
	allowGuestUpload: boolean;
	primaryColor: string | null;
	logoUrl: string | null;
};

type AlbumViewResult =
	| { status: "not_found" }
	| {
			status: "locked";
			mode: AlbumAccessMode;
			eventName: string;
			coupleNames: string | null;
	  }
	| {
			status: "ok";
			album: AlbumMeta;
			photos: AlbumPhoto[];
			canUpload: boolean;
			guestName: string | null;
	  };

/**
 * Builds a friendly, header-safe download filename for an album photo. The event
 * name is sanitised because it lands in a `Content-Disposition` header, where
 * quotes, backslashes and line breaks would corrupt the value.
 */
function albumDownloadFilename(eventName: string, storageKey: string, photoId: string): string {
	const ext = storageKey.split(".").pop() || "jpg";
	const safeName = eventName.replace(/["\\\r\n]/g, "").trim() || "album";
	return `${safeName}-${photoId.slice(0, 8)}.${ext}`;
}

async function findAlbumEvent(token: string) {
	if (!token) return null;
	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.albumToken, token), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);
	if (!event?.albumEnabled) return null;
	return event;
}

/**
 * Resolves an album for public viewing, applying the per-event access gate.
 * Read-only: cookies are persisted by the unlock/visit server actions, since
 * Server Components cannot set cookies during render.
 */
export async function getAlbumView(token: string): Promise<AlbumViewResult> {
	const event = await findAlbumEvent(token);
	if (!event) return { status: "not_found" };

	const cookie = await readGuestCookie();
	const grant = findGrant(cookie, token);

	const mode = event.albumAccessMode as AlbumAccessMode;
	const unlocked = mode === "link" || (grant?.unlocked ?? false);
	const hasIdentity = mode !== "link_identity" || Boolean(grant?.name);

	if (!unlocked || !hasIdentity) {
		return {
			status: "locked",
			mode,
			eventName: event.name,
			coupleNames: event.coupleNames,
		};
	}

	const guestId = cookie?.gid ?? null;
	const rows = await db
		.select()
		.from(schema.photos)
		.where(
			and(
				eq(schema.photos.eventId, event.id),
				isNull(schema.photos.deletedAt),
				// Everyone sees visible photos; a guest additionally sees their own
				// pending uploads so they get immediate feedback under moderation.
				guestId
					? or(eq(schema.photos.status, "visible"), eq(schema.photos.uploaderId, guestId))
					: eq(schema.photos.status, "visible"),
			),
		)
		.orderBy(desc(schema.photos.createdAt));

	const photos: AlbumPhoto[] = await Promise.all(
		rows
			.filter((photo) => photo.status !== "hidden")
			.map(async (photo) => ({
				id: photo.id,
				url: await getFileUrl(photo.storageKey),
				downloadUrl: event.allowDownload
					? await getFileUrl(photo.storageKey, {
							downloadFilename: albumDownloadFilename(event.name, photo.storageKey, photo.id),
						})
					: null,
				kind: photo.kind,
				caption: photo.caption,
				source: photo.source,
				uploaderName: photo.uploaderName,
				status: photo.status,
				createdAt: photo.createdAt,
				mine: Boolean(guestId && photo.uploaderId === guestId),
			})),
	);

	const logoUrl = event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null;

	return {
		status: "ok",
		album: {
			token,
			eventName: event.name,
			coupleNames: event.coupleNames,
			allowDownload: event.allowDownload,
			allowGuestUpload: event.allowGuestUpload,
			primaryColor: event.primaryColor,
			logoUrl,
		},
		photos,
		canUpload: event.allowGuestUpload,
		guestName: grant?.name ?? null,
	};
}

// ── Access gates (write cookies) ───────────────────────────────────────────

/** Records a visit so a "link"-mode album appears in the guest's album list. */
export async function recordAlbumVisit(token: string): Promise<void> {
	const event = await findAlbumEvent(token);
	if (event?.albumAccessMode !== "link") return;

	const cookie = ensureGuestCookie(await readGuestCookie());
	const existing = findGrant(cookie, token);
	if (existing?.unlocked) return; // already recorded

	await writeGuestCookie(
		upsertGrant(cookie, { t: token, n: event.name, unlocked: true, name: existing?.name }),
	);
}

export async function unlockAlbumWithPin(token: string, pin: string): Promise<{ ok: boolean }> {
	const event = await findAlbumEvent(token);
	if (event?.albumAccessMode !== "link_pin") return { ok: false };
	if (!event.albumPinHash || !event.albumPinSalt) return { ok: false };

	const valid = await verifyPin(pin, event.albumPinHash, event.albumPinSalt);
	if (!valid) return { ok: false };

	const cookie = ensureGuestCookie(await readGuestCookie());
	const existing = findGrant(cookie, token);
	await writeGuestCookie(
		upsertGrant(cookie, { t: token, n: event.name, unlocked: true, name: existing?.name }),
	);
	return { ok: true };
}

export async function unlockAlbumWithIdentity(
	token: string,
	name: string,
): Promise<{ ok: boolean }> {
	const event = await findAlbumEvent(token);
	if (event?.albumAccessMode !== "link_identity") return { ok: false };

	const trimmed = name.trim().slice(0, 60);
	if (trimmed.length < 1) return { ok: false };

	const cookie = ensureGuestCookie(await readGuestCookie());
	await writeGuestCookie(
		upsertGrant(cookie, { t: token, n: event.name, unlocked: true, name: trimmed }),
	);
	return { ok: true };
}

// ── Guest uploads ──────────────────────────────────────────────────────────

/**
 * Verifies the caller has cleared the album's access gate and returns the event
 * plus the (ensured) guest grant. Throws on missing access — never trust the
 * client to have done the gate.
 */
async function requireAlbumAccess(
	token: string,
): Promise<{ event: typeof schema.events.$inferSelect; guestId: string; grant: AlbumGrant }> {
	const event = await findAlbumEvent(token);
	if (!event) throw new Error("Album not found");

	const cookie = ensureGuestCookie(await readGuestCookie());
	const mode = event.albumAccessMode as AlbumAccessMode;
	let grant = findGrant(cookie, token);

	if (mode === "link") {
		// Knowing the token is sufficient; ensure a grant exists for attribution.
		if (!grant?.unlocked) {
			grant = { t: token, n: event.name, unlocked: true, name: grant?.name };
			await writeGuestCookie(upsertGrant(cookie, grant));
		}
	} else {
		const cleared = grant?.unlocked && (mode !== "link_identity" || Boolean(grant.name));
		if (!cleared || !grant) throw new Error("Album access not unlocked");
	}

	return { event, guestId: cookie.gid, grant };
}

async function assertUploadRateLimit(eventId: string, guestId: string): Promise<void> {
	const recent = await db
		.select({ id: schema.photos.id })
		.from(schema.photos)
		.where(
			and(
				eq(schema.photos.eventId, eventId),
				eq(schema.photos.uploaderId, guestId),
				isNull(schema.photos.deletedAt),
				gt(schema.photos.createdAt, new Date(Date.now() - UPLOAD_WINDOW_MS)),
			),
		);
	if (recent.length >= MAX_UPLOADS_PER_WINDOW) {
		throw new Error("Too many uploads right now. Please wait a few minutes and try again.");
	}

	const total = await db
		.select({ id: schema.photos.id })
		.from(schema.photos)
		.where(
			and(
				eq(schema.photos.eventId, eventId),
				eq(schema.photos.uploaderId, guestId),
				isNull(schema.photos.deletedAt),
			),
		);
	if (total.length >= MAX_UPLOADS_PER_GUEST_PER_EVENT) {
		throw new Error("You have reached the upload limit for this album.");
	}
}

export async function generateGuestUploadUrl(
	token: string,
	contentType: string,
	contentLength: number,
): Promise<{ uploadUrl: string; key: string }> {
	const { event, guestId } = await requireAlbumAccess(token);

	if (!event.allowGuestUpload) throw new Error("Uploads are disabled for this album");
	if (!isAllowedUploadType(contentType)) throw new Error("Unsupported file type");
	if (!Number.isFinite(contentLength) || contentLength <= 0) throw new Error("Invalid file size");
	if (contentLength > MAX_GUEST_UPLOAD_BYTES) throw new Error("File is too large");

	await assertUploadRateLimit(event.id, guestId);

	const allowed = await getPlatformClient().can(event.organizationId, "capture_photo");
	if (!allowed) throw new Error("This album is not accepting new photos.");

	return presignGuestUpload(contentType as GuestUploadContentType, contentLength);
}

export async function confirmGuestUpload(
	token: string,
	data: {
		key: string;
		width: number;
		height: number;
		caption?: string;
	},
): Promise<{ photoId: string; status: string }> {
	const { event, guestId, grant } = await requireAlbumAccess(token);
	if (!event.allowGuestUpload) throw new Error("Uploads are disabled for this album");

	// Confirm the object really landed and is within the size cap. The PUT was
	// presigned with a pinned Content-Length, but re-check defensively.
	if (!data.key.startsWith("guest/")) throw new Error("Invalid upload key");
	const sizeBytes = await getObjectSize(data.key);
	if (sizeBytes === null) throw new Error("Upload not found");
	if (sizeBytes > MAX_GUEST_UPLOAD_BYTES) {
		await deleteFile(data.key);
		throw new Error("File is too large");
	}

	await assertUploadRateLimit(event.id, guestId);

	const moderation = event.albumModeration as AlbumModeration;
	const status = moderation === "approval" ? "pending" : "visible";
	const now = new Date();

	const [photo] = await db
		.insert(schema.photos)
		.values({
			eventId: event.id,
			sessionId: null,
			source: "guest",
			uploaderId: guestId,
			uploaderName: grant.name ?? null,
			status,
			storageKey: data.key,
			shareToken: generateToken(16),
			humanCode: generateHumanCode(),
			caption: data.caption?.slice(0, 200),
			kind: "single",
			width: data.width,
			height: data.height,
			sizeBytes,
			expiresAt: event.shareExpirationDays
				? new Date(now.getTime() + event.shareExpirationDays * 24 * 60 * 60 * 1000)
				: null,
			createdAt: now,
		})
		.returning({ id: schema.photos.id });

	// Visible uploads count toward the event's photo total immediately; pending
	// ones are tallied when approved.
	if (status === "visible") {
		await db
			.update(schema.events)
			.set({ photoCount: event.photoCount + 1, updatedAt: now })
			.where(eq(schema.events.id, event.id));
	}

	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId: event.id,
		type: "photo_captured",
		bytes: sizeBytes,
		metadata: JSON.stringify({ source: "guest" }),
		createdAt: now,
	});

	getPlatformClient()
		.reportUsage(event.organizationId, "photos_captured", 1)
		.catch((err: unknown) => console.error("platform.reportUsage failed:", err));

	return { photoId: photo.id, status };
}

/** Lets a guest delete a photo they uploaded (verified by guest id). */
export async function deleteOwnGuestPhoto(
	token: string,
	photoId: string,
): Promise<{ ok: boolean }> {
	const { event, guestId } = await requireAlbumAccess(token);

	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.id, photoId), isNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);

	if (!photo || photo.eventId !== event.id || photo.uploaderId !== guestId) {
		return { ok: false };
	}

	// Soft delete so the guest can be un-deleted from the host's recycling bin;
	// the R2 object is removed by the cleanup cron after the retention window.
	await db
		.update(schema.photos)
		.set({ deletedAt: new Date() })
		.where(eq(schema.photos.id, photoId));

	if (photo.status === "visible") {
		await db
			.update(schema.events)
			.set({ photoCount: Math.max(0, event.photoCount - 1), updatedAt: new Date() })
			.where(eq(schema.events.id, event.id));
	}
	return { ok: true };
}

/** The albums this guest has unlocked, filtered to those still enabled. */
export async function listMyAlbums(): Promise<
	{ token: string; eventName: string; coupleNames: string | null }[]
> {
	const cookie = await readGuestCookie();
	if (!cookie || cookie.albums.length === 0) return [];

	const tokens = cookie.albums.filter((grant) => grant.unlocked).map((grant) => grant.t);
	if (tokens.length === 0) return [];

	const events = await db
		.select({
			albumToken: schema.events.albumToken,
			name: schema.events.name,
			coupleNames: schema.events.coupleNames,
		})
		.from(schema.events)
		.where(
			and(
				inArray(schema.events.albumToken, tokens),
				eq(schema.events.albumEnabled, true),
				isNull(schema.events.deletedAt),
			),
		);

	return events
		.filter((event): event is typeof event & { albumToken: string } => Boolean(event.albumToken))
		.map((event) => ({
			token: event.albumToken,
			eventName: event.name,
			coupleNames: event.coupleNames,
		}));
}

// ── Host / admin controls ──────────────────────────────────────────────────

type AlbumSettingsInput = {
	albumEnabled: boolean;
	albumAccessMode: AlbumAccessMode;
	allowGuestUpload: boolean;
	albumModeration: AlbumModeration;
	/** New PIN to set (link_pin mode). Empty string clears it. Undefined leaves it. */
	pin?: string;
};

export async function updateAlbumSettings(
	eventId: string,
	input: AlbumSettingsInput,
): Promise<{ albumToken: string | null }> {
	const { event } = await requireEventAccess(eventId, ["owner", "admin"]);

	const updates: Partial<typeof schema.events.$inferInsert> = {
		albumEnabled: input.albumEnabled,
		albumAccessMode: input.albumAccessMode,
		allowGuestUpload: input.allowGuestUpload,
		albumModeration: input.albumModeration,
		updatedAt: new Date(),
	};

	// Mint a token the first time the album is enabled.
	let albumToken = event.albumToken;
	if (input.albumEnabled && !albumToken) {
		albumToken = generateToken(24);
		updates.albumToken = albumToken;
	}

	if (input.pin !== undefined) {
		if (input.pin === "") {
			updates.albumPinHash = null;
			updates.albumPinSalt = null;
		} else {
			const { hash, salt } = await hashPin(input.pin);
			updates.albumPinHash = hash;
			updates.albumPinSalt = salt;
		}
	}

	await db.update(schema.events).set(updates).where(eq(schema.events.id, eventId));
	return { albumToken };
}

/** Rotates the album token, revoking any previously shared links/QRs. */
export async function regenerateAlbumToken(eventId: string): Promise<{ albumToken: string }> {
	await requireEventAccess(eventId, ["owner", "admin"]);
	const albumToken = generateToken(24);
	await db
		.update(schema.events)
		.set({ albumToken, updatedAt: new Date() })
		.where(eq(schema.events.id, eventId));
	return { albumToken };
}

type PendingGuestPhoto = {
	id: string;
	url: string;
	uploaderName: string | null;
	createdAt: Date;
};

/** Guest uploads awaiting host approval (moderation = "approval"). */
export async function listPendingGuestPhotos(eventId: string): Promise<PendingGuestPhoto[]> {
	await requireEventAccess(eventId, ["owner", "admin"]);

	const rows = await db
		.select()
		.from(schema.photos)
		.where(
			and(
				eq(schema.photos.eventId, eventId),
				eq(schema.photos.status, "pending"),
				isNull(schema.photos.deletedAt),
			),
		)
		.orderBy(desc(schema.photos.createdAt));

	return Promise.all(
		rows.map(async (photo) => ({
			id: photo.id,
			url: await getFileUrl(photo.storageKey),
			uploaderName: photo.uploaderName,
			createdAt: photo.createdAt,
		})),
	);
}

export async function moderateGuestPhoto(
	photoId: string,
	action: "approve" | "hide",
): Promise<{ ok: boolean }> {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(and(eq(schema.photos.id, photoId), isNull(schema.photos.deletedAt)))
		.then((rows) => rows[0]);
	if (!photo) return { ok: false };

	const { event } = await requireEventAccess(photo.eventId, ["owner", "admin"]);

	const nextStatus = action === "approve" ? "visible" : "hidden";
	if (nextStatus === photo.status) return { ok: true };

	await db.update(schema.photos).set({ status: nextStatus }).where(eq(schema.photos.id, photoId));

	// Keep the denormalized photo count consistent as visibility flips.
	const delta = (nextStatus === "visible" ? 1 : 0) - (photo.status === "visible" ? 1 : 0);
	if (delta !== 0) {
		await db
			.update(schema.events)
			.set({ photoCount: Math.max(0, event.photoCount + delta), updatedAt: new Date() })
			.where(eq(schema.events.id, event.id));
	}
	return { ok: true };
}
