"use server";

import { and, asc, eq, isNull } from "drizzle-orm";
import { requireEventAccess } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import {
	type CaptionPosition,
	parseAllowedFilters,
	parseCaptionPosition,
	parseSafeArea,
	type SafeArea,
} from "@/lib/db/schema";
import { parseLayoutJson } from "@/lib/layout/parse";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";
import type { BoothLayout, FilterKind, LayoutKind } from "@/lib/layout/types";
import { deleteFile, generateUploadUrl, getFileUrl } from "@/lib/storage";

export async function generateTemplateUploadUrl(eventId: string) {
	await requireEventAccess(eventId, ["owner", "admin"]);
	return await generateUploadUrl("templates", "image/png");
}

/**
 * Presigned upload for an editor asset (graphic/sticker or background image).
 * Returns the `storageKey` to persist in the layout's GraphicLayer.src /
 * BackgroundImage.src; the compositor resolves it back to a URL via getFileUrl.
 */
export async function generateTemplateAssetUploadUrl(
	eventId: string,
	contentType: string,
): Promise<{ uploadUrl: string; storageKey: string }> {
	await requireEventAccess(eventId, ["owner", "admin"]);
	const { uploadUrl, key } = await generateUploadUrl("template-assets", contentType);
	return { uploadUrl, storageKey: key };
}

/**
 * Resolve a batch of asset storage keys to readable URLs for editor/preview
 * rendering. Unknown/empty keys are skipped. Keys that already look like a URL
 * or data URI are returned unchanged so previews keep working before upload.
 */
export async function resolveAssetUrls(
	eventId: string,
	storageKeys: string[],
): Promise<Record<string, string>> {
	await requireEventAccess(eventId);
	const unique = Array.from(new Set(storageKeys.filter((key) => key.length > 0)));
	const entries = await Promise.all(
		unique.map(async (key): Promise<[string, string]> => {
			if (/^(https?:|data:|blob:)/.test(key)) return [key, key];
			return [key, await getFileUrl(key)];
		}),
	);
	return Object.fromEntries(entries);
}

export async function createTemplate(data: {
	eventId: string;
	name: string;
	storageKey: string;
	thumbnailStorageKey?: string;
	captionPosition?: CaptionPosition;
	safeArea?: SafeArea;
	/** Photobooth layout JSON (BoothLayout). When present, shotCount/kind derive from it. */
	layoutJson?: string;
	kind?: LayoutKind;
	shotCount?: number;
	presetId?: string;
	allowedFilters?: FilterKind[];
}) {
	await requireEventAccess(data.eventId, ["owner", "admin"]);

	const templates = await db
		.select({ order: schema.templates.order })
		.from(schema.templates)
		.where(eq(schema.templates.eventId, data.eventId));

	const maxOrder = templates.reduce((max, t) => Math.max(max, t.order), 0);

	const now = new Date();

	// When a photobooth layout is supplied, derive kind/shotCount from it so the
	// stored metadata always matches the layout. Falls back to legacy "single".
	const layout = data.layoutJson ? parseLayoutJson(data.layoutJson) : null;
	const kind: LayoutKind = layout?.kind ?? data.kind ?? "single";
	const shotCount = layout ? layout.photoSlots.length : (data.shotCount ?? 1);

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
			layoutJson: data.layoutJson ?? null,
			kind,
			shotCount,
			presetId: data.presetId ?? null,
			allowedFilters: data.allowedFilters ? JSON.stringify(data.allowedFilters) : null,
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
		thumbnailStorageKey?: string;
		/** Photobooth layout JSON (BoothLayout). When present, kind/shotCount derive from it. */
		layoutJson?: string;
		presetId?: string | null;
		allowedFilters?: FilterKind[];
	},
) {
	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) {
		throw new Error("Template not found");
	}

	await requireEventAccess(template.eventId, ["owner", "admin"]);

	const updates: Partial<typeof schema.templates.$inferInsert> = { updatedAt: new Date() };
	if (data.name !== undefined) updates.name = data.name;
	if (data.enabled !== undefined) updates.enabled = data.enabled;
	if (data.order !== undefined) updates.order = data.order;
	if (data.captionPosition !== undefined) {
		updates.captionPositionJson = JSON.stringify(data.captionPosition);
	}
	if (data.safeArea !== undefined) {
		updates.safeAreaJson = JSON.stringify(data.safeArea);
	}
	if (data.thumbnailStorageKey !== undefined) {
		updates.thumbnailStorageKey = data.thumbnailStorageKey;
	}
	if (data.presetId !== undefined) {
		updates.presetId = data.presetId;
	}
	if (data.allowedFilters !== undefined) {
		updates.allowedFilters = JSON.stringify(data.allowedFilters);
	}
	// When a layout is supplied, keep the stored kind/shotCount in sync with it.
	if (data.layoutJson !== undefined) {
		updates.layoutJson = data.layoutJson;
		const layout = parseLayoutJson(data.layoutJson);
		if (layout) {
			updates.kind = layout.kind;
			updates.shotCount = layout.photoSlots.length;
		}
	}

	await db.update(schema.templates).set(updates).where(eq(schema.templates.id, templateId));
}

/**
 * Fetch a single template (with its parsed layout) for editing in the WYSIWYG
 * editor. Returns null when the template does not exist.
 */
export async function getTemplate(templateId: string) {
	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) return null;

	await requireEventAccess(template.eventId, ["owner", "admin"]);

	return {
		id: template.id,
		eventId: template.eventId,
		name: template.name,
		enabled: template.enabled,
		layoutJson: template.layoutJson,
		layout: parseLayoutJson(template.layoutJson),
		kind: template.kind,
		shotCount: template.shotCount,
		presetId: template.presetId,
		allowedFilters: parseAllowedFilters(template.allowedFilters),
		thumbnailStorageKey: template.thumbnailStorageKey,
	};
}

export interface PresetSummary {
	id: string;
	name: string;
	kind: LayoutKind;
	shotCount: number;
	/** Full BoothLayout to seed the editor (id assigned per-instance on save). */
	layout: BoothLayout;
}

/**
 * List the presets available to start a new layout from. Reads the DB `presets`
 * table when seeded and falls back to the built-in presets so the editor always
 * has starting points even on a fresh database.
 */
export async function listPresets(): Promise<PresetSummary[]> {
	const rows = await db.select().from(schema.presets).orderBy(asc(schema.presets.name));

	if (rows.length > 0) {
		return rows.flatMap((row): PresetSummary[] => {
			const layout = parseLayoutJson(row.layoutJson);
			if (!layout) return [];
			return [
				{
					id: row.id,
					name: row.name,
					kind: layout.kind,
					shotCount: layout.photoSlots.length,
					layout: { ...layout, id: row.id },
				},
			];
		});
	}

	return BUILTIN_PRESETS.map((preset) => ({
		id: preset.id,
		name: preset.name,
		kind: preset.layout.kind,
		shotCount: preset.shotCount,
		layout: { ...preset.layout, id: preset.id },
	}));
}

export async function deleteTemplate(templateId: string) {
	const template = await db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.id, templateId))
		.then((rows) => rows[0]);

	if (!template) return;

	await requireEventAccess(template.eventId, ["owner", "admin"]);

	// Layout-only templates store no PNG overlay (storageKey is empty).
	if (template.storageKey) {
		await deleteFile(template.storageKey);
	}
	if (template.thumbnailStorageKey) {
		await deleteFile(template.thumbnailStorageKey);
	}

	await db.delete(schema.templates).where(eq(schema.templates.id, templateId));
}

export async function listTemplates(eventId: string, enabledOnly?: boolean) {
	await requireEventAccess(eventId);

	const baseQuery = db
		.select()
		.from(schema.templates)
		.where(eq(schema.templates.eventId, eventId))
		.orderBy(asc(schema.templates.order));

	const templates = await baseQuery;

	const filtered = enabledOnly ? templates.filter((t) => t.enabled) : templates;

	return await Promise.all(
		filtered.map(async (template) => {
			const url = template.storageKey ? await getFileUrl(template.storageKey) : null;
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
		.where(and(eq(schema.events.id, eventId), isNull(schema.events.deletedAt)))
		.then((rows) => rows[0]);

	if (event?.status !== "active") {
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
			const url = template.storageKey ? await getFileUrl(template.storageKey) : null;
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
				layoutJson: template.layoutJson,
				kind: template.kind,
				shotCount: template.shotCount,
				allowedFilters: parseAllowedFilters(template.allowedFilters),
			};
		}),
	);
}

export async function reorderTemplates(eventId: string, templateIds: string[]) {
	await requireEventAccess(eventId, ["owner", "admin"]);

	const now = new Date();
	for (let i = 0; i < templateIds.length; i++) {
		await db
			.update(schema.templates)
			.set({
				order: i + 1,
				updatedAt: now,
			})
			// Scope to eventId too: requireEventAccess only authorizes this event,
			// so a template id from another event must not be reorderable here.
			.where(and(eq(schema.templates.id, templateIds[i]), eq(schema.templates.eventId, eventId)));
	}
}
