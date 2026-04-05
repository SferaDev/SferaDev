"use server";

import { asc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import {
	type CaptionPosition,
	parseCaptionPosition,
	parseSafeArea,
	type SafeArea,
} from "@/lib/db/schema";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function generateTemplateUploadUrl(eventId: string) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId, ["owner", "admin"]);

	return await generateUploadUrl("templates", "image/png");
}

export async function createTemplate(data: {
	eventId: string;
	name: string;
	storageKey: string;
	thumbnailStorageKey?: string;
	captionPosition?: CaptionPosition;
	safeArea?: SafeArea;
}) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, data.eventId, ["owner", "admin"]);

	// Get the max order for this event
	const templates = await db
		.select({ order: schema.templates.order })
		.from(schema.templates)
		.where(eq(schema.templates.eventId, data.eventId));

	const maxOrder = templates.reduce((max, t) => Math.max(max, t.order), 0);

	const now = new Date();

	const [template] = await db
		.insert(schema.templates)
		.values({
			eventId: data.eventId,
			name: data.name,
			storageKey: data.storageKey,
			thumbnailStorageKey: data.thumbnailStorageKey,
			enabled: true,
			order: maxOrder + 1,
			captionPositionJson: data.captionPosition ? JSON.stringify(data.captionPosition) : null,
			safeAreaJson: data.safeArea ? JSON.stringify(data.safeArea) : null,
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: schema.templates.id });

	return template.id;
}

export async function updateTemplate(
	templateId: string,
	data: {
		name?: string;
		enabled?: boolean;
		order?: number;
		captionPosition?: CaptionPosition;
		safeArea?: SafeArea;
	},
) {
	const session = await requireSession();

	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) {
		throw new Error("Template not found");
	}

	await requireEventAccess(session.user.id, template.eventId, ["owner", "admin"]);

	const updates: Record<string, unknown> = { updatedAt: new Date() };
	if (data.name !== undefined) updates.name = data.name;
	if (data.enabled !== undefined) updates.enabled = data.enabled;
	if (data.order !== undefined) updates.order = data.order;
	if (data.captionPosition !== undefined) {
		updates.captionPositionJson = JSON.stringify(data.captionPosition);
	}
	if (data.safeArea !== undefined) {
		updates.safeAreaJson = JSON.stringify(data.safeArea);
	}

	await db.update(schema.templates).set(updates).where(eq(schema.templates.id, templateId));
}

export async function deleteTemplate(templateId: string) {
	const session = await requireSession();

	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) return;

	await requireEventAccess(session.user.id, template.eventId, ["owner", "admin"]);

	await deleteFile(template.storageKey);
	if (template.thumbnailStorageKey) {
		await deleteFile(template.thumbnailStorageKey);
	}

	await db.delete(schema.templates).where(eq(schema.templates.id, templateId));
}

export async function listTemplates(eventId: string, enabledOnly?: boolean) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId);

	const baseQuery = db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.eventId, eventId))
		.orderBy(asc(schema.templates.order));

	const templates = await baseQuery;

	const filtered = enabledOnly ? templates.filter((t) => t.enabled) : templates;

	return await Promise.all(
		filtered.map(async (template) => {
			const url = await getFileUrl(template.storageKey);
			const thumbnailUrl = template.thumbnailStorageKey
				? await getFileUrl(template.thumbnailStorageKey)
				: null;
			return {
				...template,
				url,
				thumbnailUrl,
				captionPosition: parseCaptionPosition(template.captionPositionJson),
				safeArea: parseSafeArea(template.safeAreaJson),
			};
		}),
	);
}

export async function listPublicTemplates(eventId: string) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event || event.status !== "active") {
		return [];
	}

	const templates = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.eventId, eventId))
		.orderBy(asc(schema.templates.order));

	const enabled = templates.filter((t) => t.enabled);

	return await Promise.all(
		enabled.map(async (template) => {
			const url = await getFileUrl(template.storageKey);
			const thumbnailUrl = template.thumbnailStorageKey
				? await getFileUrl(template.thumbnailStorageKey)
				: url;
			return {
				id: template.id,
				name: template.name,
				url,
				thumbnailUrl,
				captionPosition: parseCaptionPosition(template.captionPositionJson),
				safeArea: parseSafeArea(template.safeAreaJson),
			};
		}),
	);
}

export async function getTemplate(templateId: string) {
	const session = await requireSession();

	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) return null;

	await requireEventAccess(session.user.id, template.eventId);

	const url = await getFileUrl(template.storageKey);
	const thumbnailUrl = template.thumbnailStorageKey
		? await getFileUrl(template.thumbnailStorageKey)
		: null;

	return {
		...template,
		url,
		thumbnailUrl,
		captionPosition: parseCaptionPosition(template.captionPositionJson),
		safeArea: parseSafeArea(template.safeAreaJson),
	};
}

export async function reorderTemplates(eventId: string, templateIds: string[]) {
	const session = await requireSession();
	await requireEventAccess(session.user.id, eventId, ["owner", "admin"]);

	const now = new Date();
	for (let i = 0; i < templateIds.length; i++) {
		await db
			.update(schema.templates)
			.set({
				order: i + 1,
				updatedAt: now,
			})
			.where(eq(schema.templates.id, templateIds[i]));
	}
}
