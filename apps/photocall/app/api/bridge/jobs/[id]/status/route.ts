import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBridge } from "@/lib/bridge-auth";
import { db, schema } from "@/lib/db";

// The bridge may report progress, completion, failure, or hand a job back to
// the queue for retry (e.g. a transient printer error).
const statusSchema = z.object({
	status: z.enum(["printing", "done", "failed", "queued"]),
	error: z.string().optional(),
	attempts: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const event = await authenticateBridge(request);
	if (!event) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

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

	const { status, error, attempts } = parsed.data;

	// The job must exist AND belong to the token's event — never let one event's
	// bridge mutate another event's jobs.
	const [job] = await db
		.select()
		.from(schema.printJobs)
		.where(and(eq(schema.printJobs.id, id), eq(schema.printJobs.eventId, event.id)))
		.limit(1);

	if (!job) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	const [updated] = await db
		.update(schema.printJobs)
		.set({
			status,
			lastError: error ?? null,
			// Only overwrite the attempt count when the bridge reports one.
			...(attempts !== undefined && { attempts }),
			printedAt: status === "done" ? new Date() : job.printedAt,
			updatedAt: new Date(),
		})
		.where(and(eq(schema.printJobs.id, id), eq(schema.printJobs.eventId, event.id)))
		.returning();

	return NextResponse.json({ job: updated });
}
