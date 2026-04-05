import { and, eq, isNotNull, lt, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

const BATCH_LIMIT = 50;
const MS_PER_DAY = 86_400_000;

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const now = Date.now();
	const nowDate = new Date();
	let deleted = 0;
	const deletedPhotoIds = new Set<string>();

	// 1. Find photos expired by event retention policy (retentionDays or deleteAfterDate)
	const allEvents = await db
		.select()
		.from(schema.events)
		.where(or(isNotNull(schema.events.retentionDays), isNotNull(schema.events.deleteAfterDate)));

	for (const event of allEvents) {
		if (deleted >= BATCH_LIMIT) break;

		const retentionCutoff =
			event.retentionDays != null ? new Date(now - event.retentionDays * MS_PER_DAY) : undefined;
		const pastDeleteDate = event.deleteAfterDate != null && nowDate > event.deleteAfterDate;

		const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, event.id));

		for (const photo of photos) {
			if (deleted >= BATCH_LIMIT) break;

			const expiredByRetention = retentionCutoff != null && photo.createdAt < retentionCutoff;

			if (expiredByRetention || pastDeleteDate) {
				await deleteFile(photo.storageKey);
				await db.delete(schema.photos).where(eq(schema.photos.id, photo.id));
				deletedPhotoIds.add(photo.id);

				// Re-read event to get current photoCount
				const [currentEvent] = await db
					.select()
					.from(schema.events)
					.where(eq(schema.events.id, event.id));

				if (currentEvent) {
					await db
						.update(schema.events)
						.set({
							photoCount: Math.max(0, currentEvent.photoCount - 1),
							updatedAt: nowDate,
						})
						.where(eq(schema.events.id, event.id));
				}

				const [org] = await db
					.select()
					.from(schema.organizations)
					.where(eq(schema.organizations.id, event.organizationId));

				if (org) {
					await db
						.update(schema.organizations)
						.set({
							currentStorageBytes: Math.max(0, org.currentStorageBytes - photo.sizeBytes),
							updatedAt: nowDate,
						})
						.where(eq(schema.organizations.id, org.id));

					await db.insert(schema.usageLogs).values({
						organizationId: org.id,
						eventId: event.id,
						type: "storage_removed",
						bytes: photo.sizeBytes,
						createdAt: nowDate,
					});
				}

				deleted++;
			}
		}
	}

	// 2. Find photos with explicit expiresAt that have passed
	if (deleted < BATCH_LIMIT) {
		const expiredPhotos = await db
			.select()
			.from(schema.photos)
			.where(and(isNotNull(schema.photos.expiresAt), lt(schema.photos.expiresAt, nowDate)));

		for (const photo of expiredPhotos) {
			if (deleted >= BATCH_LIMIT) break;
			if (deletedPhotoIds.has(photo.id)) continue;

			const [event] = await db
				.select()
				.from(schema.events)
				.where(eq(schema.events.id, photo.eventId));

			await deleteFile(photo.storageKey);
			await db.delete(schema.photos).where(eq(schema.photos.id, photo.id));

			if (event) {
				const [currentEvent] = await db
					.select()
					.from(schema.events)
					.where(eq(schema.events.id, event.id));

				if (currentEvent) {
					await db
						.update(schema.events)
						.set({
							photoCount: Math.max(0, currentEvent.photoCount - 1),
							updatedAt: nowDate,
						})
						.where(eq(schema.events.id, event.id));
				}

				const [org] = await db
					.select()
					.from(schema.organizations)
					.where(eq(schema.organizations.id, event.organizationId));

				if (org) {
					await db
						.update(schema.organizations)
						.set({
							currentStorageBytes: Math.max(0, org.currentStorageBytes - photo.sizeBytes),
							updatedAt: nowDate,
						})
						.where(eq(schema.organizations.id, org.id));

					await db.insert(schema.usageLogs).values({
						organizationId: org.id,
						eventId: event.id,
						type: "storage_removed",
						bytes: photo.sizeBytes,
						createdAt: nowDate,
					});
				}
			}

			deleted++;
		}
	}

	if (deleted > 0) {
		console.log(`Cleanup: deleted ${deleted} expired photo(s)`);
	}

	return NextResponse.json({ deleted });
}
