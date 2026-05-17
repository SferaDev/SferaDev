"use server";

import { desc, eq } from "drizzle-orm";
import { generateHumanCode, generateToken, requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { getPlatformClient } from "@/lib/platform";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function generatePhotoUploadUrl(eventId: string) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
		throw new Error("Event not found or not active");
	}

	return await generateUploadUrl("photos", "image/jpeg");
}

export async function createPhoto(data: {
	eventId: string;
	sessionId: string;
	storageKey: string;
	caption?: string;
	templateId?: string;
	width: number;
	height: number;
	sizeBytes: number;
}) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, data.eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
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
			shareToken,
			humanCode,
			caption: data.caption,
			templateId: data.templateId,
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
	platform.reportUsage(event.organizationId, "photos_captured", 1).catch((err) => {
		console.error("platform.reportUsage failed:", err);
	});

	return { photoId: photo.id, shareToken, humanCode };
}

export async function getPhotoByShareToken(shareToken: string) {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.shareToken, shareToken))
		.then((rows) => rows[0]);

	if (!photo) return null;

	if (photo.expiresAt && photo.expiresAt < new Date()) {
		return null;
	}

	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, photo.eventId))
		.then((rows) => rows[0]);

	if (!event) return null;

	const url = await getFileUrl(photo.storageKey);

	return {
		...photo,
		url,
		eventName: event.name,
		allowDownload: event.allowDownload,
		allowPrint: event.allowPrint,
		showQrCode: event.showQrCode,
	};
}

export async function getPhotoByHumanCode(humanCode: string) {
	const photo = await db
		.select({ shareToken: schema.photos.shareToken, expiresAt: schema.photos.expiresAt })
		.from(schema.photos)
		.where(eq(schema.photos.humanCode, humanCode.toUpperCase()))
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
		.where(eq(schema.photos.eventId, eventId))
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

export async function listRecentPhotos(eventId: string, limit?: number) {
	await requireEventAccess(eventId);

	const take = limit ?? 10;

	const photos = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.eventId, eventId))
		.orderBy(desc(schema.photos.createdAt))
		.limit(take);

	return await Promise.all(
		photos.map(async (photo) => {
			const url = await getFileUrl(photo.storageKey);
			return { ...photo, url };
		}),
	);
}

export async function listRecentPublicPhotos(eventId: string, limit?: number) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
		return [];
	}

	const take = limit ?? 10;

	const photos = await db
		.select({
			id: schema.photos.id,
			storageKey: schema.photos.storageKey,
			humanCode: schema.photos.humanCode,
			createdAt: schema.photos.createdAt,
		})
		.from(schema.photos)
		.where(eq(schema.photos.eventId, eventId))
		.orderBy(desc(schema.photos.createdAt))
		.limit(take);

	return await Promise.all(
		photos.map(async (photo) => {
			const url = await getFileUrl(photo.storageKey);
			return {
				id: photo.id,
				url,
				humanCode: photo.humanCode,
				createdAt: photo.createdAt,
			};
		}),
	);
}

export async function getPhoto(photoId: string) {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.id, photoId))
		.then((rows) => rows[0]);

	if (!photo) return null;

	await requireEventAccess(photo.eventId);

	const url = await getFileUrl(photo.storageKey);
	return { ...photo, url };
}

export async function deletePhoto(photoId: string) {
	const photo = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.id, photoId))
		.then((rows) => rows[0]);

	if (!photo) return;

	const { event } = await requireEventAccess(photo.eventId, ["owner", "admin"]);

	await deleteFile(photo.storageKey);
	await db.delete(schema.photos).where(eq(schema.photos.id, photoId));

	const now = new Date();
	await db
		.update(schema.events)
		.set({
			photoCount: Math.max(0, event.photoCount - 1),
			updatedAt: now,
		})
		.where(eq(schema.events.id, photo.eventId));

	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId: photo.eventId,
		type: "storage_removed",
		bytes: photo.sizeBytes,
		createdAt: now,
	});
}

export async function deleteAllPhotos(eventId: string) {
	const { event } = await requireEventAccess(eventId, ["owner", "admin"]);

	const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, eventId));

	let totalStorageFreed = 0;
	for (const photo of photos) {
		await deleteFile(photo.storageKey);
		totalStorageFreed += photo.sizeBytes;
	}

	await db.delete(schema.photos).where(eq(schema.photos.eventId, eventId));

	const now = new Date();
	await db
		.update(schema.events)
		.set({
			photoCount: 0,
			updatedAt: now,
		})
		.where(eq(schema.events.id, eventId));

	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId,
		type: "storage_removed",
		bytes: totalStorageFreed,
		createdAt: now,
	});

	return { deleted: photos.length };
}

export async function getPhotoCount(eventId: string) {
	await requireEventAccess(eventId);

	const event = await db
		.select({ photoCount: schema.events.photoCount })
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	return event?.photoCount ?? 0;
}
