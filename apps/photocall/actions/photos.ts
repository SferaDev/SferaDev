"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { generateHumanCode, generateToken, requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
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

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, event.organizationId))
		.then((rows) => rows[0]);

	if (!org) {
		throw new Error("Organization not found");
	}

	// Check photo limit
	if (org.maxPhotosPerEvent !== -1 && event.photoCount >= org.maxPhotosPerEvent) {
		throw new Error("Photo limit reached for this event");
	}

	// Check storage limit
	if (org.currentStorageBytes + data.sizeBytes > org.maxStorageBytes) {
		throw new Error("Storage limit reached. Upgrade your plan for more storage.");
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

	// Update organization storage
	await db
		.update(schema.organizations)
		.set({
			currentStorageBytes: org.currentStorageBytes + data.sizeBytes,
			updatedAt: now,
		})
		.where(eq(schema.organizations.id, org.id));

	// Log usage
	await db.insert(schema.usageLogs).values({
		organizationId: org.id,
		eventId: data.eventId,
		type: "photo_captured",
		bytes: data.sizeBytes,
		createdAt: now,
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
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId);

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
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId);

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
	const session = await requireSession();

	const photo = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.id, photoId))
		.then((rows) => rows[0]);

	if (!photo) return null;

	await requireEventAccess(session.user.id, photo.eventId);

	const url = await getFileUrl(photo.storageKey);
	return { ...photo, url };
}

export async function deletePhoto(photoId: string) {
	const session = await requireSession();

	const photo = await db
		.select()
		.from(schema.photos)
		.where(eq(schema.photos.id, photoId))
		.then((rows) => rows[0]);

	if (!photo) return;

	const { event } = await requireEventAccess(session.user.id, photo.eventId, ["owner", "admin"]);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, event.organizationId))
		.then((rows) => rows[0]);

	await deleteFile(photo.storageKey);

	await db.delete(schema.photos).where(eq(schema.photos.id, photoId));

	// Update event stats
	const now = new Date();
	await db
		.update(schema.events)
		.set({
			photoCount: Math.max(0, event.photoCount - 1),
			updatedAt: now,
		})
		.where(eq(schema.events.id, photo.eventId));

	// Update organization storage
	if (org) {
		await db
			.update(schema.organizations)
			.set({
				currentStorageBytes: Math.max(0, org.currentStorageBytes - photo.sizeBytes),
				updatedAt: now,
			})
			.where(eq(schema.organizations.id, org.id));

		// Log usage
		await db.insert(schema.usageLogs).values({
			organizationId: org.id,
			eventId: photo.eventId,
			type: "storage_removed",
			bytes: photo.sizeBytes,
			createdAt: now,
		});
	}
}

export async function deleteAllPhotos(eventId: string) {
	const session = await requireSession();
	const { event } = await requireEventAccess(session.user.id, eventId, ["owner", "admin"]);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, event.organizationId))
		.then((rows) => rows[0]);

	const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, eventId));

	let totalStorageFreed = 0;
	for (const photo of photos) {
		await deleteFile(photo.storageKey);
		totalStorageFreed += photo.sizeBytes;
	}

	await db.delete(schema.photos).where(eq(schema.photos.eventId, eventId));

	// Update event stats
	const now = new Date();
	await db
		.update(schema.events)
		.set({
			photoCount: 0,
			updatedAt: now,
		})
		.where(eq(schema.events.id, eventId));

	// Update organization storage
	if (org) {
		await db
			.update(schema.organizations)
			.set({
				currentStorageBytes: Math.max(0, org.currentStorageBytes - totalStorageFreed),
				updatedAt: now,
			})
			.where(eq(schema.organizations.id, org.id));

		// Log usage
		await db.insert(schema.usageLogs).values({
			organizationId: org.id,
			eventId,
			type: "storage_removed",
			bytes: totalStorageFreed,
			createdAt: now,
		});
	}

	return { deleted: photos.length };
}

export async function getPhotoCount(eventId: string) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId);

	const event = await db
		.select({ photoCount: schema.events.photoCount })
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	return event?.photoCount ?? 0;
}
