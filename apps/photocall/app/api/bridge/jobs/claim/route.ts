import { and, asc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
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

// How long a `claimed`/`printing` job may go WITHOUT a heartbeat before another
// claim re-queues it. A live bridge refreshes `claimedAt` via status reports
// while it prints (see the status route), so this window only trips for a bridge
// that has genuinely gone silent (crashed / lost network) — never a slow-but-
// healthy print. Kept well above worst-case print time so a busy printer is
// never re-queued out from under itself.
const STALE_CLAIM_INTERVAL = sql`interval '5 minutes'`;

// A job that keeps getting stranded (claimed then never finished) is dead-lettered
// after this many claim attempts instead of being reprinted forever. `attempts` is
// bumped once per claim below.
const MAX_ATTEMPTS = 5;

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
		// A claim is "stale" when its bridge stopped heartbeating for the window
		// above. Such jobs belong to a bridge that has gone silent.
		const isStaleClaim = and(
			eq(schema.printJobs.eventId, event.id),
			or(eq(schema.printJobs.status, "claimed"), eq(schema.printJobs.status, "printing")),
			lt(schema.printJobs.claimedAt, sql`now() - ${STALE_CLAIM_INTERVAL}`),
		);

		// (a1) Dead-letter stale jobs that have already been claimed MAX_ATTEMPTS
		// times — a job that keeps stranding must not be reprinted endlessly.
		await tx
			.update(schema.printJobs)
			.set({
				status: "failed",
				lastError: "Stranded by the print bridge too many times",
				claimedAt: null,
				claimedBy: null,
				updatedAt: new Date(),
			})
			.where(and(isStaleClaim, gte(schema.printJobs.attempts, MAX_ATTEMPTS)));

		// (a2) Re-queue the remaining stale claims so a crashed/restarted bridge
		// doesn't strand them. `attempts` is NOT bumped here — it's bumped once per
		// claim in (b), so a job stranded N times has been claimed N times.
		await tx
			.update(schema.printJobs)
			.set({ status: "queued", claimedAt: null, claimedBy: null, updatedAt: new Date() })
			.where(and(isStaleClaim, lt(schema.printJobs.attempts, MAX_ATTEMPTS)));

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
				// Count this hand-out; (a1) dead-letters once it crosses MAX_ATTEMPTS.
				attempts: sql`${schema.printJobs.attempts} + 1`,
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
