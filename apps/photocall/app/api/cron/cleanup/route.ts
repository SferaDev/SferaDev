import { and, eq, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { RECYCLE_BIN_RETENTION_DAYS } from "@/lib/recycle-bin";
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

/**
 * Best-effort R2 delete: a single missing/failing object must never block the
 * rest of the batch, so failures are logged and swallowed.
 */
async function safeDeleteFile(key: string): Promise<void> {
	await deleteFile(key).catch((err: unknown) => {
		console.error(`Cleanup: failed to delete object ${key}:`, err);
	});
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
	const recycleCutoff = new Date(now - RECYCLE_BIN_RETENTION_DAYS * MS_PER_DAY);

	// ── 1. Recycling bin: permanently purge soft-deleted items past retention ──
	let purgedPhotos = 0;
	let purgedEvents = 0;

	// 1a. Soft-deleted photos. Their owning event is fetched via an inner join so
	// we can log freed storage against the org without an extra per-row lookup.
	// (Photos under soft-deleted events are removed when the event is purged in
	// 1b, so the inner join skips them here.)
	const recycledPhotos = await db
		.select({
			id: schema.photos.id,
			eventId: schema.photos.eventId,
			storageKey: schema.photos.storageKey,
			sizeBytes: schema.photos.sizeBytes,
			organizationId: schema.events.organizationId,
		})
		.from(schema.photos)
		.innerJoin(schema.events, eq(schema.photos.eventId, schema.events.id))
		.where(
			and(
				isNull(schema.events.deletedAt),
				isNotNull(schema.photos.deletedAt),
				lt(schema.photos.deletedAt, recycleCutoff),
			),
		)
		.limit(BATCH_LIMIT);

	for (const photo of recycledPhotos) {
		await safeDeleteFile(photo.storageKey);
		await db.delete(schema.photos).where(eq(schema.photos.id, photo.id));

		await db.insert(schema.usageLogs).values({
			organizationId: photo.organizationId,
			eventId: photo.eventId,
			type: "storage_removed",
			bytes: photo.sizeBytes,
			createdAt: nowDate,
		});

		purgedPhotos++;
	}

	// 1b. Soft-deleted events past retention: remove every photo's + template's
	// R2 object, then delete the event (and its child rows).
	const recycledEvents = await db
		.select()
		.from(schema.events)
		.where(and(isNotNull(schema.events.deletedAt), lt(schema.events.deletedAt, recycleCutoff)))
		.limit(BATCH_LIMIT);

	for (const event of recycledEvents) {
		const photos = await db
			.select({ storageKey: schema.photos.storageKey })
			.from(schema.photos)
			.where(eq(schema.photos.eventId, event.id));
		for (const photo of photos) await safeDeleteFile(photo.storageKey);

		const templates = await db
			.select({
				storageKey: schema.templates.storageKey,
				thumbnailStorageKey: schema.templates.thumbnailStorageKey,
			})
			.from(schema.templates)
			.where(eq(schema.templates.eventId, event.id));
		for (const template of templates) {
			await safeDeleteFile(template.storageKey);
			if (template.thumbnailStorageKey) await safeDeleteFile(template.thumbnailStorageKey);
		}

		// Delete child rows explicitly so the purge is robust regardless of FK
		// cascade configuration, then the event itself.
		await db.delete(schema.photos).where(eq(schema.photos.eventId, event.id));
		await db.delete(schema.templates).where(eq(schema.templates.eventId, event.id));
		await db.delete(schema.kioskSessions).where(eq(schema.kioskSessions.eventId, event.id));
		await db.delete(schema.events).where(eq(schema.events.id, event.id));

		await db.insert(schema.usageLogs).values({
			organizationId: event.organizationId,
			eventId: event.id,
			type: "storage_removed",
			bytes: 0,
			createdAt: nowDate,
		});

		purgedEvents++;
	}

	// ── 2. Retention + expired shares (existing behavior) ──
	// Operates only on live (not soft-deleted) photos under live events.
	let deleted = 0;
	const deletedPhotoIds = new Set<string>();

	const allEvents = await db
		.select()
		.from(schema.events)
		.where(
			and(
				isNull(schema.events.deletedAt),
				or(isNotNull(schema.events.retentionDays), isNotNull(schema.events.deleteAfterDate)),
			),
		);

	for (const event of allEvents) {
		if (deleted >= BATCH_LIMIT) break;

		const retentionCutoff =
			event.retentionDays != null ? new Date(now - event.retentionDays * MS_PER_DAY) : undefined;
		const pastDeleteDate = event.deleteAfterDate != null && nowDate > event.deleteAfterDate;

		// Build a query that returns ONLY the photos that should be purged, bounded
		// by the remaining batch budget — never load an event's whole photo set
		// into memory. Past the explicit delete date everything goes; otherwise
		// only photos older than the retention cutoff. Soft-deleted photos are
		// excluded here (the recycling-bin purge above owns them).
		const expiredFilter = pastDeleteDate
			? and(eq(schema.photos.eventId, event.id), isNull(schema.photos.deletedAt))
			: retentionCutoff != null
				? and(
						eq(schema.photos.eventId, event.id),
						isNull(schema.photos.deletedAt),
						lt(schema.photos.createdAt, retentionCutoff),
					)
				: undefined;
		if (!expiredFilter) continue;

		const photos = await db
			.select()
			.from(schema.photos)
			.where(expiredFilter)
			.limit(BATCH_LIMIT - deleted);

		for (const photo of photos) {
			if (deleted >= BATCH_LIMIT) break;

			await safeDeleteFile(photo.storageKey);
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
			.where(
				and(
					isNull(schema.photos.deletedAt),
					isNotNull(schema.photos.expiresAt),
					lt(schema.photos.expiresAt, nowDate),
				),
			)
			.limit(BATCH_LIMIT - deleted);

		for (const photo of expiredPhotos) {
			if (deleted >= BATCH_LIMIT) break;
			if (deletedPhotoIds.has(photo.id)) continue;

			const [event] = await db
				.select()
				.from(schema.events)
				.where(eq(schema.events.id, photo.eventId));

			await safeDeleteFile(photo.storageKey);
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

	if (purgedPhotos > 0 || purgedEvents > 0 || deleted > 0) {
		console.log(
			`Cleanup: purged ${purgedPhotos} recycled photo(s), ${purgedEvents} recycled event(s); deleted ${deleted} expired photo(s)`,
		);
	}

	return NextResponse.json({ purgedPhotos, purgedEvents, deleted });
}
