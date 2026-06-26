"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import {
	generateSlug,
	hashPin,
	requireEventAccess,
	requireOrgMembership,
	requireSession,
	verifyPin,
} from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { getPlatformClient } from "@/lib/platform";
import { generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function createEvent(
	organizationId: string,
	name: string,
	description?: string,
	startDate?: Date,
	endDate?: Date,
) {
	await requireOrgMembership(organizationId, ["owner", "admin"]);

	const allowed = await getPlatformClient().can(organizationId, "create_event");
	if (!allowed) {
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
	await requireOrgMembership(organizationId);

	const events = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.organizationId, organizationId), isNull(schema.events.deletedAt)));

	return Promise.all(
		events.map(async (event) => ({
			...event,
			logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
		})),
	);
}

export async function getEventBySlug(organizationSlug: string, eventSlug: string) {
	const platform = getPlatformClient();
	const { user } = await requireSession();
	const { headers: nextHeaders } = await import("next/headers");
	const hdrs = await nextHeaders();

	const org = await platform.getOrganization(organizationSlug, hdrs);
	if (!org) return null;

	const members = await platform.listMembers(org.id, hdrs);
	if (!members.some((m) => m.userId === user.id)) return null;

	const event = await db
		.select()
		.from(schema.events)
		.where(
			and(
				eq(schema.events.organizationId, org.id),
				eq(schema.events.slug, eventSlug),
				isNull(schema.events.deletedAt),
			),
		)
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
		cameraDeviceId?: string | null;
		cameraDeviceLabel?: string | null;
		captureZoom?: number;
		mirrorPhotos?: boolean;
		photoQuality?: number;
		maxPhotoDimension?: number;
		primaryColor?: string | null;
		logoStorageKey?: string | null;
		welcomeMessage?: string;
		thankYouMessage?: string;
		// Kiosk chrome overrides (null clears the override → kiosk i18n default).
		attractTitle?: string | null;
		attractSubtitle?: string | null;
		ctaLabel?: string | null;
		consentText?: string | null;
		skipConsent?: boolean;
		accentColor?: string | null;
		fontFamily?: string | null;
		showPoweredBy?: boolean;
		shareExpirationDays?: number | null;
		allowDownload?: boolean;
		allowPrint?: boolean;
		showQrCode?: boolean;
		retentionDays?: number | null;
		deleteAfterDate?: Date;
		// Photobooth personalization + capture + print settings
		coupleNames?: string;
		captureWhoChoosesFilter?: "guest" | "host";
		captureDefaultCountdown?: number;
		captureAutoShoot?: boolean;
		captureAutoStart?: boolean;
		boomerangEnabled?: boolean;
		printMethod?: "none" | "bridge" | "manual";
		printPrinterId?: string;
		printPaperSize?: string;
		printMediaType?: string;
		printBorderless?: boolean;
		printCopies?: number;
		printOrientation?: "portrait" | "landscape";
		printAutoPrint?: boolean;
	},
) {
	await requireEventAccess(id, ["owner", "admin"]);

	await db
		.update(schema.events)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(schema.events.id, id));
}

/**
 * Presigned upload for an event logo. Returns the `storageKey` to persist on
 * `event.logoStorageKey` (via {@link updateEvent}); the kiosk resolves it back
 * to `logoUrl` through getFileUrl.
 */
export async function generateEventLogoUploadUrl(
	id: string,
	contentType: string,
): Promise<{ uploadUrl: string; storageKey: string }> {
	await requireEventAccess(id, ["owner", "admin"]);
	const { uploadUrl, key } = await generateUploadUrl("event-logos", contentType);
	return { uploadUrl, storageKey: key };
}

export async function setKioskPin(id: string, pin: string) {
	await requireEventAccess(id, ["owner", "admin"]);

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

/**
 * Soft-deletes an event: stamps `deletedAt` on the event AND all its photos so
 * the event vanishes from listings and its photos drop out of every album/share
 * lookup, while staying recoverable from the recycling bin. Nothing is removed
 * from R2 here — the cleanup cron purges events (and their photos' objects)
 * whose `deletedAt` is older than RECYCLE_BIN_RETENTION_DAYS.
 */
export async function deleteEvent(id: string) {
	const { event } = await requireEventAccess(id, ["owner", "admin"]);

	const now = new Date();

	// Cascade the soft delete to the event's not-already-deleted photos so they
	// disappear from share/album lookups (which query photos directly by token).
	await db
		.update(schema.photos)
		.set({ deletedAt: now })
		.where(and(eq(schema.photos.eventId, id), isNull(schema.photos.deletedAt)));

	await db
		.update(schema.events)
		.set({ deletedAt: now, photoCount: 0, updatedAt: now })
		.where(eq(schema.events.id, id));

	// Reference event in a log so we keep usage history even after delete.
	await db.insert(schema.usageLogs).values({
		organizationId: event.organizationId,
		eventId: id,
		type: "event_deleted",
		createdAt: now,
	});
}

export async function duplicateEvent(id: string) {
	const { event } = await requireEventAccess(id, ["owner", "admin"]);

	const allowed = await getPlatformClient().can(event.organizationId, "create_event");
	if (!allowed) {
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
			logoStorageKey: event.logoStorageKey,
			welcomeMessage: event.welcomeMessage,
			thankYouMessage: event.thankYouMessage,
			// Kiosk chrome overrides carry over to the duplicate.
			attractTitle: event.attractTitle,
			attractSubtitle: event.attractSubtitle,
			ctaLabel: event.ctaLabel,
			consentText: event.consentText,
			skipConsent: event.skipConsent,
			accentColor: event.accentColor,
			fontFamily: event.fontFamily,
			showPoweredBy: event.showPoweredBy,
			shareExpirationDays: event.shareExpirationDays,
			allowDownload: event.allowDownload,
			allowPrint: event.allowPrint,
			showQrCode: event.showQrCode,
			retentionDays: event.retentionDays,
			language: event.language,
			// Photobooth config carries over to the duplicate.
			coupleNames: event.coupleNames,
			cameraDeviceId: event.cameraDeviceId,
			cameraDeviceLabel: event.cameraDeviceLabel,
			captureZoom: event.captureZoom,
			captureWhoChoosesFilter: event.captureWhoChoosesFilter,
			captureDefaultCountdown: event.captureDefaultCountdown,
			captureAutoShoot: event.captureAutoShoot,
			captureAutoStart: event.captureAutoStart,
			mirrorPhotos: event.mirrorPhotos,
			boomerangEnabled: event.boomerangEnabled,
			printMethod: event.printMethod,
			printPrinterId: event.printPrinterId,
			printPaperSize: event.printPaperSize,
			printMediaType: event.printMediaType,
			printBorderless: event.printBorderless,
			printCopies: event.printCopies,
			printOrientation: event.printOrientation,
			printAutoPrint: event.printAutoPrint,
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
			layoutJson: template.layoutJson,
			kind: template.kind,
			shotCount: template.shotCount,
			presetId: template.presetId,
			allowedFilters: template.allowedFilters,
			createdAt: now,
			updatedAt: now,
		});
	}

	return newEvent.id;
}

export async function getEventStats(id: string) {
	await requireEventAccess(id);

	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, id))
		.then((rows) => rows[0]);

	if (!event) return null;

	const recentSessions = await db
		.select()
		.from(schema.kioskSessions)
		.where(eq(schema.kioskSessions.eventId, id))
		.orderBy(desc(schema.kioskSessions.startedAt))
		.limit(10);

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
	const platform = getPlatformClient();

	// Service-token call: anonymous kiosk pages must resolve the org without
	// a user session.
	const org = await platform.lookupOrganization(organizationSlug);
	if (!org) return null;

	const event = await db
		.select()
		.from(schema.events)
		.where(
			and(
				eq(schema.events.organizationId, org.id),
				eq(schema.events.slug, eventSlug),
				isNull(schema.events.deletedAt),
			),
		)
		.then((rows) => rows[0]);

	if (event?.status !== "active") return null;

	return {
		id: event.id,
		name: event.name,
		organizationName: org.name,
		welcomeMessage: event.welcomeMessage,
		thankYouMessage: event.thankYouMessage,
		primaryColor: event.primaryColor,
		// Kiosk chrome overrides (null → kiosk falls back to its i18n default).
		attractTitle: event.attractTitle,
		attractSubtitle: event.attractSubtitle,
		ctaLabel: event.ctaLabel,
		consentText: event.consentText,
		skipConsent: event.skipConsent,
		accentColor: event.accentColor,
		fontFamily: event.fontFamily,
		showPoweredBy: event.showPoweredBy,
		logoUrl: event.logoStorageKey ? await getFileUrl(event.logoStorageKey) : null,
		slideshowEnabled: event.slideshowEnabled,
		slideshowSafeMode: event.slideshowSafeMode,
		idleTimeoutSeconds: event.idleTimeoutSeconds,
		defaultCamera: event.defaultCamera,
		cameraDeviceId: event.cameraDeviceId,
		cameraDeviceLabel: event.cameraDeviceLabel,
		captureZoom: event.captureZoom,
		startDate: event.startDate,
		photoQuality: event.photoQuality,
		maxPhotoDimension: event.maxPhotoDimension,
		allowDownload: event.allowDownload,
		allowPrint: event.allowPrint,
		showQrCode: event.showQrCode,
		retentionDays: event.retentionDays,
		coupleNames: event.coupleNames,
		captureDefaultCountdown: event.captureDefaultCountdown,
		captureAutoShoot: event.captureAutoShoot,
		captureAutoStart: event.captureAutoStart,
		mirrorPhotos: event.mirrorPhotos,
		captureWhoChoosesFilter: event.captureWhoChoosesFilter,
		boomerangEnabled: event.boomerangEnabled,
		// Print settings (consumed by the kiosk result page).
		printMethod: event.printMethod,
		printPrinterId: event.printPrinterId,
		printPaperSize: event.printPaperSize,
		printMediaType: event.printMediaType,
		printBorderless: event.printBorderless,
		printCopies: event.printCopies,
		printOrientation: event.printOrientation,
		printAutoPrint: event.printAutoPrint,
	};
}
