"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { generateToken, requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";

/**
 * Server-side print queue.
 *
 * The kiosk no longer POSTs images straight to the LAN bridge (blocked by mixed
 * content on an HTTPS prod kiosk). Instead it uploads the print-ready image to
 * R2 and enqueues a small {@link schema.printJobs} row here. The on-site bridge
 * polls `/api/bridge/jobs/claim` (outbound), downloads the bytes via a presigned
 * R2 GET, prints, and reports status back — the image never passes through the
 * database or a Server Action body.
 */

/** Parameters captured at enqueue time, snapshotted from the event print config. */
export interface EnqueuePrintJobInput {
	eventId: string;
	/** R2 key of the print-ready image (the composited/tiled strip). */
	imageStorageKey: string;
	/** Bridge-side printer id to target (required — the schema needs a printerId). */
	printerId: string;
	paperSize: string;
	mediaType?: string;
	borderless: boolean;
	copies: number;
	orientation: string;
	/** The originating photo, when the print comes from a stored capture. */
	photoId?: string;
}

/**
 * Enqueue a print job for the on-site bridge to claim. Mirrors the active-event
 * guard in {@link import("./photos").createPhoto}: a paused/archived/deleted
 * event must not accept new prints. The payload is small — a storage key plus
 * print parameters — never image bytes.
 */
export async function enqueuePrintJob(input: EnqueuePrintJobInput): Promise<{ jobId: string }> {
	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.id, input.eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (event?.status !== "active") {
		throw new Error("Event not found or not active");
	}

	const [job] = await db
		.insert(schema.printJobs)
		.values({
			eventId: input.eventId,
			photoId: input.photoId,
			imageStorageKey: input.imageStorageKey,
			printerId: input.printerId,
			paperSize: input.paperSize,
			mediaType: input.mediaType,
			borderless: input.borderless,
			copies: input.copies,
			orientation: input.orientation,
			status: "queued",
		})
		.returning({ id: schema.printJobs.id });

	return { jobId: job.id };
}

/** A {@link schema.printJobs} row as returned to the dashboard queue. */
export type PrintJob = typeof schema.printJobs.$inferSelect;

/**
 * Recent print jobs for an event, most recent first, for the dashboard queue.
 * Visible on every device (unlike the per-device offline outbox), so a host can
 * watch the server-side queue drain regardless of which kiosk enqueued a job.
 */
export async function listPrintJobs(eventId: string): Promise<PrintJob[]> {
	await requireEventAccess(eventId);

	return db
		.select()
		.from(schema.printJobs)
		.where(eq(schema.printJobs.eventId, eventId))
		.orderBy(desc(schema.printJobs.createdAt))
		.limit(50);
}

/**
 * Generate (or rotate) the event's bridge pairing token and return it. The
 * on-site bridge authenticates every poll/heartbeat with this token (see
 * `lib/bridge-auth.ts`), so regenerating it immediately revokes any previously
 * paired bridge. Uses the same CSPRNG as the share/album tokens.
 */
export async function rotateBridgePairingToken(eventId: string): Promise<{ token: string }> {
	await requireEventAccess(eventId, ["owner", "admin"]);

	const token = generateToken(32);
	await db
		.update(schema.events)
		.set({ bridgePairingToken: token, updatedAt: new Date() })
		.where(eq(schema.events.id, eventId));

	return { token };
}

/** The event's current bridge pairing token, or null if none has been generated. */
export async function getBridgePairingToken(eventId: string): Promise<{ token: string | null }> {
	const { event } = await requireEventAccess(eventId);
	return { token: event.bridgePairingToken };
}

/** A printer reported by the on-site bridge, with its JSON columns parsed. */
export interface ReportedPrinter {
	id: string;
	printerId: string;
	name: string;
	makeAndModel: string | null;
	state: string | null;
	stateReasons: string[];
	markerLevels: number[];
	mediaSupported: string[];
	reachable: boolean;
	lastSeenAt: Date;
}

/** Parse a stored JSON text column into a typed array (empty on null/parse error). */
function parseJsonArray<T>(json: string | null): T[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as T[]) : [];
	} catch {
		return [];
	}
}

/**
 * Printers the on-site bridge has reported for an event (heartbeated to
 * `/api/bridge/printers`), with the JSON columns parsed into arrays.
 */
export async function listReportedPrinters(eventId: string): Promise<ReportedPrinter[]> {
	await requireEventAccess(eventId);

	const rows = await db
		.select()
		.from(schema.bridgePrinters)
		.where(eq(schema.bridgePrinters.eventId, eventId))
		.orderBy(desc(schema.bridgePrinters.lastSeenAt));

	return rows.map((row) => ({
		id: row.id,
		printerId: row.printerId,
		name: row.name,
		makeAndModel: row.makeAndModel,
		state: row.state,
		stateReasons: parseJsonArray<string>(row.stateReasons),
		markerLevels: parseJsonArray<number>(row.markerLevels),
		mediaSupported: parseJsonArray<string>(row.mediaSupported),
		reachable: row.reachable,
		lastSeenAt: row.lastSeenAt,
	}));
}
