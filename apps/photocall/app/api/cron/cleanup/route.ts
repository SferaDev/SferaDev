import { and, eq, isNotNull, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

const BATCH_LIMIT = 50;
const MS_PER_DAY = 86_400_000;

/** Atomically decrement an event's photoCount, clamped at zero. */
function decrementPhotoCount(eventId: string, at: Date) {
	return db
		.update(schema.events)
		.set({
			photoCount: sql`greatest(${schema.events.photoCount} - 1, 0)`,
			updatedAt: at,
		})
		.where(eq(schema.events.id, eventId));
}

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET;
	const authHeader = request.headers.get("authorization");
	// Require the secret to be configured: comparing against an unset env var
	// would accept the literal "Bearer undefined" from any caller.
	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const now = Date.now();
	const nowDate = new Date();
	let deleted = 0;
	const deletedPhotoIds = new Set<string>();

	const allEvents = await db
		.select()
		.from(schema.events)
		.where(or(isNotNull(schema.events.retentionDays), isNotNull(schema.events.deleteAfterDate)));

	for (const event of allEvents) {
		if (deleted >= BATCH_LIMIT) break;

		const retentionCutoff =
			event.retentionDays != null ? new Date(now - event.retentionDays * MS_PER_DAY) : undefined;
		const pastDeleteDate = event.deleteAfterDate != null && nowDate > event.deleteAfterDate;

		// Build a query that returns ONLY the photos that should be purged, bounded
		// by the remaining batch budget — never load an event's whole photo set
		// into memory. Past the explicit delete date everything goes; otherwise
		// only photos older than the retention cutoff.
		const expiredFilter = pastDeleteDate
			? eq(schema.photos.eventId, event.id)
			: retentionCutoff != null
				? and(eq(schema.photos.eventId, event.id), lt(schema.photos.createdAt, retentionCutoff))
				: undefined;
		if (!expiredFilter) continue;

		const photos = await db
			.select()
			.from(schema.photos)
			.where(expiredFilter)
			.limit(BATCH_LIMIT - deleted);

		for (const photo of photos) {
			if (deleted >= BATCH_LIMIT) break;

			await deleteFile(photo.storageKey);
			await db.delete(schema.photos).where(eq(schema.photos.id, photo.id));
			deletedPhotoIds.add(photo.id);

			await decrementPhotoCount(event.id, nowDate);

			await db.insert(schema.usageLogs).values({
				organizationId: event.organizationId,
				eventId: event.id,
				type: "storage_removed",
				bytes: photo.sizeBytes,
				createdAt: nowDate,
			});

			deleted++;
		}
	}

	if (deleted < BATCH_LIMIT) {
		const expiredPhotos = await db
			.select()
			.from(schema.photos)
			.where(and(isNotNull(schema.photos.expiresAt), lt(schema.photos.expiresAt, nowDate)))
			.limit(BATCH_LIMIT - deleted);

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
				await decrementPhotoCount(event.id, nowDate);

				await db.insert(schema.usageLogs).values({
					organizationId: event.organizationId,
					eventId: event.id,
					type: "storage_removed",
					bytes: photo.sizeBytes,
					createdAt: nowDate,
				});
			}

			deleted++;
		}
	}

	if (deleted > 0) {
		console.log(`Cleanup: deleted ${deleted} expired photo(s)`);
	}

	return NextResponse.json({ deleted });
}
