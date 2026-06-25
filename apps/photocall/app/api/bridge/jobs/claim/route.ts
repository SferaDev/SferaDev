import { and, asc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBridge } from "@/lib/bridge-auth";
import { db, schema } from "@/lib/db";
import { getFileUrl } from "@/lib/storage";

// A claim must never grab the whole queue at once: keep batches small so a
// crashed bridge only ever strands a handful of jobs (re-queued after the
// stale window below).
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

// How long a `claimed`/`printing` job may sit before another claim re-queues
// it. A bridge that crashed mid-print must not strand jobs forever.
const STALE_CLAIM_INTERVAL = sql`interval '2 minutes'`;

const claimSchema = z.object({
	bridgeId: z.string().min(1),
	limit: z.number().int().positive().max(MAX_LIMIT).optional(),
});

export async function POST(request: Request) {
	const event = await authenticateBridge(request);
	if (!event) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = claimSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request body", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const { bridgeId } = parsed.data;
	const limit = parsed.data.limit ?? DEFAULT_LIMIT;

	// Claim atomically so two concurrent bridge instances never grab the same
	// job: inside one transaction we (a) re-queue this event's stale claims, then
	// (b) lock + claim the oldest queued rows, skipping any rows another claim is
	// already holding (`FOR UPDATE SKIP LOCKED`).
	const claimedIds = await db.transaction(async (tx) => {
		// (a) Re-queue stale claims for this event.
		await tx
			.update(schema.printJobs)
			.set({ status: "queued", claimedAt: null, claimedBy: null, updatedAt: new Date() })
			.where(
				and(
					eq(schema.printJobs.eventId, event.id),
					or(eq(schema.printJobs.status, "claimed"), eq(schema.printJobs.status, "printing")),
					lt(schema.printJobs.claimedAt, sql`now() - ${STALE_CLAIM_INTERVAL}`),
				),
			);

		// (b) Lock the oldest queued jobs for this event, skipping rows another
		// concurrent claim already holds.
		const lockedRows = await tx
			.select({ id: schema.printJobs.id })
			.from(schema.printJobs)
			.where(and(eq(schema.printJobs.eventId, event.id), eq(schema.printJobs.status, "queued")))
			.orderBy(asc(schema.printJobs.createdAt))
			.limit(limit)
			.for("update", { skipLocked: true });

		const ids = lockedRows.map((row) => row.id);
		if (ids.length === 0) return ids;

		await tx
			.update(schema.printJobs)
			.set({
				status: "claimed",
				claimedAt: new Date(),
				claimedBy: bridgeId,
				updatedAt: new Date(),
			})
			.where(inArray(schema.printJobs.id, ids));

		return ids;
	});

	if (claimedIds.length === 0) {
		return NextResponse.json({ jobs: [] });
	}

	// Read back the claimed rows (still scoped to this event) and attach a fresh
	// presigned GET URL so the bridge can download the print-ready bytes directly
	// from R2 — the image never passes through this server.
	const rows = await db
		.select()
		.from(schema.printJobs)
		.where(and(eq(schema.printJobs.eventId, event.id), inArray(schema.printJobs.id, claimedIds)));

	const jobs = await Promise.all(
		rows.map(async (job) => ({
			id: job.id,
			imageUrl: await getFileUrl(job.imageStorageKey),
			printerId: job.printerId,
			paperSize: job.paperSize,
			mediaType: job.mediaType,
			borderless: job.borderless,
			copies: job.copies,
			orientation: job.orientation,
		})),
	);

	return NextResponse.json({ jobs });
}
