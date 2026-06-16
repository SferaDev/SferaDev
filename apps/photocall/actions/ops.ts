"use server";

import { and, eq, gte } from "drizzle-orm";
import { requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { checkStorageRoundTrip } from "@/lib/storage";

/**
 * Verifies object storage is reachable and writable by round-tripping a tiny
 * object. Returns a discriminated result instead of throwing so the kiosk
 * checklist/operator panel can render a clean pass/fail row.
 */
export async function checkStorage(
	eventId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
	try {
		await requireEventAccess(eventId);
		await checkStorageRoundTrip();
		return { ok: true };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : "Storage check failed" };
	}
}

interface OpsSnapshot {
	sessionsToday: number;
	completedToday: number;
}

async function querySnapshot(eventId: string): Promise<OpsSnapshot> {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const sessions = await db
		.select({ status: schema.kioskSessions.status })
		.from(schema.kioskSessions)
		.where(
			and(
				eq(schema.kioskSessions.eventId, eventId),
				gte(schema.kioskSessions.startedAt, startOfToday),
			),
		);

	return {
		sessionsToday: sessions.length,
		completedToday: sessions.filter((session) => session.status === "completed").length,
	};
}

/**
 * Authenticated operational snapshot for the dashboard: how many sessions
 * started today and how many of those completed. Cheaper than
 * {@link getEventStats} (no per-session payload) and scoped to the current day
 * in the server's timezone.
 */
export async function getEventOpsSnapshot(eventId: string): Promise<OpsSnapshot> {
	await requireEventAccess(eventId);
	return querySnapshot(eventId);
}

/**
 * Same snapshot exposed to the anonymous kiosk operator panel. The panel is
 * PIN-gated on the client (see {@link useAdminAuth}); this returns only
 * aggregate counts (no session payloads), and only for an active event.
 */
export async function getPublicEventOpsSnapshot(eventId: string): Promise<OpsSnapshot> {
	const event = await db
		.select({ status: schema.events.status })
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
		return { sessionsToday: 0, completedToday: 0 };
	}
	return querySnapshot(eventId);
}
