import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBridge } from "@/lib/bridge-auth";
import { db, schema } from "@/lib/db";

// The bridge may report progress, completion, failure, or hand a job back to
// the queue for retry (e.g. a transient printer error). `bridgeId` identifies the
// reporter so a stale/duplicate report from a superseded bridge can't clobber the
// job; `attempts` is server-managed (bumped once per claim) so the bridge never
// sets it.
const statusSchema = z.object({
	bridgeId: z.string().min(1),
	status: z.enum(["printing", "done", "failed", "queued"]),
	error: z.string().optional(),
});

const idSchema = z.string().uuid();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const event = await authenticateBridge(request);
	if (!event) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	// print_jobs.id is a uuid column — reject a malformed id with a clean 400
	// instead of letting Postgres raise 22P02 (an unhandled 500).
	if (!idSchema.safeParse(id).success) {
		return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = statusSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request body", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const { bridgeId, status, error } = parsed.data;
	const now = new Date();

	// Status-specific side effects:
	//  - printing: refresh `claimedAt` as a heartbeat so the claim route's stale
	//    sweep never re-queues a slow-but-healthy print out from under this bridge.
	//  - done: stamp printedAt.
	//  - queued: the bridge is handing the job back for retry — release the claim
	//    so it can be re-claimed.
	const sideEffects =
		status === "printing"
			? { claimedAt: now }
			: status === "done"
				? { printedAt: now }
				: status === "queued"
					? { claimedAt: null, claimedBy: null }
					: {};

	// Apply ONLY if the job is still owned by the reporting bridge AND not yet
	// terminal. Scoping by (id, eventId) blocks cross-event mutation; scoping by
	// claimedBy + a non-terminal status rejects a late/duplicate report (e.g. a
	// `done` arriving after a stale-requeue reassigned the job) so a finished job
	// is never resurrected and another instance can't clobber this one.
	const [updated] = await db
		.update(schema.printJobs)
		.set({ status, lastError: error ?? null, updatedAt: now, ...sideEffects })
		.where(
			and(
				eq(schema.printJobs.id, id),
				eq(schema.printJobs.eventId, event.id),
				eq(schema.printJobs.claimedBy, bridgeId),
				or(eq(schema.printJobs.status, "claimed"), eq(schema.printJobs.status, "printing")),
			),
		)
		.returning();

	if (!updated) {
		// Not claimed by this bridge anymore (re-queued, reassigned, or already
		// finished) — tell the bridge to stop reporting on it.
		return NextResponse.json({ error: "Job is not claimed by this bridge" }, { status: 409 });
	}

	return NextResponse.json({ job: updated });
}
