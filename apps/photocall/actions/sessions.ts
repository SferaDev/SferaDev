"use server";

import { desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";

export async function createKioskSession(eventId: string) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
		throw new Error("Event not found or not active");
	}

	const now = new Date();

	const [session] = await db
		.insert(schema.kioskSessions)
		.values({
			eventId,
			status: "started",
			startedAt: now,
		})
		.returning({ id: schema.kioskSessions.id });

	// Update event session count
	await db
		.update(schema.events)
		.set({
			sessionCount: event.sessionCount + 1,
			updatedAt: now,
		})
		.where(eq(schema.events.id, eventId));

	return session.id;
}

export async function selectTemplate(sessionId: string, templateId: string) {
	const session = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0]);

	if (!session) {
		throw new Error("Session not found");
	}

	await db
		.update(schema.kioskSessions)
		.set({
			status: "template_selected",
			templateId,
		})
		.where(eq(schema.kioskSessions.id, sessionId));
}

export async function saveCapture(sessionId: string, capturedImageUrl: string) {
	const session = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0]);

	if (!session) {
		throw new Error("Session not found");
	}

	await db
		.update(schema.kioskSessions)
		.set({
			status: "captured",
			capturedImageUrl,
		})
		.where(eq(schema.kioskSessions.id, sessionId));
}

export async function personalizeSession(sessionId: string, caption?: string, mirrored?: boolean) {
	const session = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0]);

	if (!session) {
		throw new Error("Session not found");
	}

	await db
		.update(schema.kioskSessions)
		.set({
			status: "personalized",
			caption,
			mirrored,
		})
		.where(eq(schema.kioskSessions.id, sessionId));
}

export async function completeSession(sessionId: string) {
	const session = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0]);

	if (!session) {
		throw new Error("Session not found");
	}

	await db
		.update(schema.kioskSessions)
		.set({
			status: "completed",
			completedAt: new Date(),
		})
		.where(eq(schema.kioskSessions.id, sessionId));
}

export async function abandonSession(sessionId: string) {
	const session = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0]);

	if (session && session.status !== "completed") {
		await db
			.update(schema.kioskSessions)
			.set({ status: "abandoned" })
			.where(eq(schema.kioskSessions.id, sessionId));
	}
}

export async function getKioskSession(sessionId: string) {
	return await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.id, sessionId))
		.then((rows) => rows[0] ?? null);
}

export async function getSessionStats(eventId: string) {
	const authSession = await requireSession();
	await requireEventAccess(authSession.user.id, eventId);

	const sessions = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.eventId, eventId));

	const completed = sessions.filter((s) => s.status === "completed").length;
	const abandoned = sessions.filter((s) => s.status === "abandoned").length;
	const inProgress = sessions.filter((s) => !["completed", "abandoned"].includes(s.status)).length;

	return {
		total: sessions.length,
		completed,
		abandoned,
		inProgress,
		completionRate: sessions.length > 0 ? completed / sessions.length : 0,
	};
}

export async function listSessions(eventId: string, limit?: number) {
	const authSession = await requireSession();
	await requireEventAccess(authSession.user.id, eventId);

	const take = limit ?? 50;

	return await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.eventId, eventId))
		.orderBy(desc(schema.kioskSessions.startedAt))
		.limit(take);
}
