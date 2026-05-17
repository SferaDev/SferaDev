"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import {
	generateSlug,
	hashPin,
	requireEventAccess,
	requireOrgMembership,
	verifyPin,
} from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function createEvent(
	organizationId: string,
	name: string,
	description?: string,
	startDate?: Date,
	endDate?: Date,
) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId, ["owner", "admin"]);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, organizationId))
		.then((rows) => rows[0]);

	if (!org) {
		throw new Error("Organization not found");
	}

	// Check event limit
	const eventCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(schema.events)
		.where(eq(schema.events.organizationId, organizationId))
		.then((rows) => Number(rows[0].count));

	if (org.maxEvents !== -1 && eventCount >= org.maxEvents) {
		throw new Error("Event limit reached. Upgrade your plan to create more events.");
	}

	// Generate unique slug within organization
	const baseSlug = generateSlug(name);
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existing = await db
			.select({ id: schema.events.id })
			.from(schema.events)
			.where(and(eq(schema.events.organizationId, organizationId), eq(schema.events.slug, slug)))
			.then((rows) => rows[0]);
		if (!existing) break;
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	const now = new Date();

	const [event] = await db
		.insert(schema.events)
		.values({
			organizationId,
			name,
			slug,
			description,
			startDate,
			endDate,
			status: "draft",
			slideshowEnabled: true,
			slideshowSafeMode: false,
			idleTimeoutSeconds: 120,
			defaultCamera: "user",
			photoQuality: 0.9,
			maxPhotoDimension: 1920,
			allowDownload: true,
			allowPrint: true,
			showQrCode: true,
			photoCount: 0,
			sessionCount: 0,
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: schema.events.id });

	return event.id;
}

export async function listEvents(organizationId: string) {
	const session = await requireSession();
	await requireOrgMembership(session.user.id, organizationId);

	const events = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.organizationId, organizationId));

	return Promise.all(
		events.map(async (event) => ({
			...event,
			logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
		})),
	);
}

export async function getEvent(id: string) {
	const session = await requireSession();
	const { event } = await requireEventAccess(session.user.id, id);

	return {
		...event,
		logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
	};
}

export async function getEventBySlug(organizationSlug: string, eventSlug: string) {
	const session = await requireSession();

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.slug, organizationSlug))
		.then((rows) => rows[0]);

	if (!org) return null;

	await requireOrgMembership(session.user.id, org.id);

	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.organizationId, org.id), eq(schema.events.slug, eventSlug)))
		.then((rows) => rows[0]);

	if (!event) return null;

	return {
		...event,
		organization: org,
		logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
	};
}

export async function updateEvent(
	id: string,
	data: {
		name?: string;
		description?: string;
		startDate?: Date;
		endDate?: Date;
		status?: "draft" | "active" | "paused" | "archived";
		slideshowEnabled?: boolean;
		slideshowSafeMode?: boolean;
		idleTimeoutSeconds?: number;
		defaultCamera?: "user" | "environment";
		photoQuality?: number;
		maxPhotoDimension?: number;
		primaryColor?: string;
		logoStorageKey?: string;
		welcomeMessage?: string;
		thankYouMessage?: string;
		shareExpirationDays?: number;
		allowDownload?: boolean;
		allowPrint?: boolean;
		showQrCode?: boolean;
		retentionDays?: number;
		deleteAfterDate?: Date;
	},
) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, id, ["owner", "admin"]);

	await db
		.update(schema.events)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(schema.events.id, id));
}

export async function setKioskPin(id: string, pin: string) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, id, ["owner", "admin"]);

	if (pin.length < 4) {
		throw new Error("PIN must be at least 4 characters");
	}

	const { hash, salt } = await hashPin(pin);

	await db
		.update(schema.events)
		.set({
			kioskPinHash: hash,
			kioskPinSalt: salt,
			updatedAt: new Date(),
		})
		.where(eq(schema.events.id, id));
}

export async function validateKioskPin(id: string, pin: string) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, id))
		.then((rows) => rows[0]);

	if (!event) {
		throw new Error("Event not found");
	}

	if (!event.kioskPinHash || !event.kioskPinSalt) {
		throw new Error("No PIN set for this event");
	}

	const isValid = await verifyPin(pin, event.kioskPinHash, event.kioskPinSalt);
	if (!isValid) {
		throw new Error("Invalid PIN");
	}

	return true;
}

export async function deleteEvent(id: string) {
	const session = await requireSession();
	const { event } = await requireEventAccess(session.user.id, id, ["owner", "admin"]);

	// Delete all photos and update storage
	const photos = await db.select().from(schema.photos).where(eq(schema.photos.eventId, id));

	let totalStorageFreed = 0;
	for (const photo of photos) {
		await deleteFile(photo.storageKey);
		totalStorageFreed += photo.sizeBytes;
	}
	await db.delete(schema.photos).where(eq(schema.photos.eventId, id));

	// Update organization storage
	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, event.organizationId))
		.then((rows) => rows[0]);

	if (org) {
		await db
			.update(schema.organizations)
			.set({
				currentStorageBytes: Math.max(0, org.currentStorageBytes - totalStorageFreed),
				updatedAt: new Date(),
			})
			.where(eq(schema.organizations.id, org.id));
	}

	// Delete templates and their storage files
	const templates = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.eventId, id));

	for (const template of templates) {
		await deleteFile(template.storageKey);
		if (template.thumbnailStorageKey) {
			await deleteFile(template.thumbnailStorageKey);
		}
	}
	await db.delete(schema.templates).where(eq(schema.templates.eventId, id));

	// Delete sessions
	await db.delete(schema.kioskSessions).where(eq(schema.kioskSessions.eventId, id));

	// Delete the event
	await db.delete(schema.events).where(eq(schema.events.id, id));
}

export async function duplicateEvent(id: string) {
	const session = await requireSession();
	const { event } = await requireEventAccess(session.user.id, id, ["owner", "admin"]);

	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.id, event.organizationId))
		.then((rows) => rows[0]);

	if (!org) {
		throw new Error("Organization not found");
	}

	// Check event limit
	const eventCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(schema.events)
		.where(eq(schema.events.organizationId, event.organizationId))
		.then((rows) => Number(rows[0].count));

	if (org.maxEvents !== -1 && eventCount >= org.maxEvents) {
		throw new Error("Event limit reached. Upgrade your plan to create more events.");
	}

	// Generate new slug
	const baseSlug = `${event.slug}-copy`;
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existing = await db
			.select({ id: schema.events.id })
			.from(schema.events)
			.where(
				and(eq(schema.events.organizationId, event.organizationId), eq(schema.events.slug, slug)),
			)
			.then((rows) => rows[0]);
		if (!existing) break;
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	const now = new Date();

	const [newEvent] = await db
		.insert(schema.events)
		.values({
			organizationId: event.organizationId,
			name: `${event.name} (Copy)`,
			slug,
			description: event.description,
			status: "draft",
			slideshowEnabled: event.slideshowEnabled,
			slideshowSafeMode: event.slideshowSafeMode,
			idleTimeoutSeconds: event.idleTimeoutSeconds,
			defaultCamera: event.defaultCamera,
			photoQuality: event.photoQuality,
			maxPhotoDimension: event.maxPhotoDimension,
			primaryColor: event.primaryColor,
			welcomeMessage: event.welcomeMessage,
			thankYouMessage: event.thankYouMessage,
			shareExpirationDays: event.shareExpirationDays,
			allowDownload: event.allowDownload,
			allowPrint: event.allowPrint,
			showQrCode: event.showQrCode,
			retentionDays: event.retentionDays,
			photoCount: 0,
			sessionCount: 0,
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: schema.events.id });

	// Duplicate templates (reference same storage files)
	const templates = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.eventId, id));

	for (const template of templates) {
		await db.insert(schema.templates).values({
			eventId: newEvent.id,
			name: template.name,
			storageKey: template.storageKey,
			thumbnailStorageKey: template.thumbnailStorageKey,
			enabled: template.enabled,
			order: template.order,
			captionPositionJson: template.captionPositionJson,
			safeAreaJson: template.safeAreaJson,
			createdAt: now,
			updatedAt: now,
		});
	}

	return newEvent.id;
}

export async function getEventStats(id: string) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, id);

	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, id))
		.then((rows) => rows[0]);

	if (!event) return null;

	// Get recent sessions
	const recentSessions = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.eventId, id))
		.orderBy(desc(schema.kioskSessions.startedAt))
		.limit(10);

	// Calculate session stats
	const allSessions = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.eventId, id));

	const completedSessions = allSessions.filter((s) => s.status === "completed");
	const conversionRate =
		allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0;

	return {
		photoCount: event.photoCount,
		sessionCount: event.sessionCount,
		completedSessions: completedSessions.length,
		conversionRate,
		recentSessions,
	};
}

// Public query for kiosk mode (no auth required)
export async function getPublicEvent(organizationSlug: string, eventSlug: string) {
	const org = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.slug, organizationSlug))
		.then((rows) => rows[0]);

	if (!org) return null;

	const event = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.organizationId, org.id), eq(schema.events.slug, eventSlug)))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") return null;

	return {
		id: event.id,
		name: event.name,
		organizationName: org.name,
		welcomeMessage: event.welcomeMessage,
		thankYouMessage: event.thankYouMessage,
		primaryColor: event.primaryColor,
		logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
		slideshowEnabled: event.slideshowEnabled,
		slideshowSafeMode: event.slideshowSafeMode,
		idleTimeoutSeconds: event.idleTimeoutSeconds,
		defaultCamera: event.defaultCamera,
		photoQuality: event.photoQuality,
		maxPhotoDimension: event.maxPhotoDimension,
		allowDownload: event.allowDownload,
		allowPrint: event.allowPrint,
		showQrCode: event.showQrCode,
		retentionDays: event.retentionDays,
	};
}

export async function generateEventUploadUrl(eventId: string) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId, ["owner", "admin"]);

	return await generateUploadUrl(`events/${eventId}`, "image/png");
}
