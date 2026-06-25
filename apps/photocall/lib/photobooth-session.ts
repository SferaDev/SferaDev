"use client";

import { BOOMERANG_STORE, tx } from "@/lib/db/idb";
import type { FilterKind } from "@/lib/layout/types";

/**
 * Client-side, per-session store for the multi-shot capture in progress. Shots
 * are persisted in `sessionStorage` (keyed by the kiosk session id) so they
 * survive navigation between the capture and result screens and work fully
 * offline — this is the source of truth, with the server `saveMultiCapture`
 * call being best-effort.
 *
 * The boomerang GIF is the exception: at high resolution it is several MB, which
 * overflows sessionStorage's ~5MB string quota, so it travels as a Blob in
 * IndexedDB (see {@link putBoomerangBlob}) rather than inlined here. The session
 * JSON only records that a boomerang exists, via its pixel dimensions.
 */

export interface PhotoboothSession {
	/** Captured frames as JPEG data URLs, in slot order. Empty for boomerangs,
	 * whose single "shot" is the encoded GIF stored as a Blob in IndexedDB. */
	shots: string[];
	/** Filter chosen by the guest/host for the whole strip. */
	filter: FilterKind;
	/**
	 * Pixel dimensions of the boomerang GIF, needed for the photo record. Present
	 * only for the boomerang capture path; the GIF bytes themselves live in
	 * IndexedDB ({@link getBoomerangBlob}), not in this session JSON.
	 */
	boomerangWidth?: number;
	boomerangHeight?: number;
}

interface BoomerangBlobRow {
	id: string;
	blob: Blob;
}

/**
 * Stash the encoded boomerang GIF as a Blob in IndexedDB, keyed by the kiosk
 * session id, so the result screen can read it back after navigation. Used
 * instead of sessionStorage because a high-resolution GIF exceeds the
 * sessionStorage quota. No-op when IndexedDB is unavailable.
 */
export async function putBoomerangBlob(sessionId: string, blob: Blob): Promise<void> {
	if (typeof indexedDB === "undefined") return;
	await tx(BOOMERANG_STORE, "readwrite", (store) =>
		store.put({ id: sessionId, blob } satisfies BoomerangBlobRow),
	);
}

/** Read back the boomerang GIF Blob for a session, or null if absent. */
export async function getBoomerangBlob(sessionId: string): Promise<Blob | null> {
	if (typeof indexedDB === "undefined") return null;
	const row = await tx<BoomerangBlobRow | undefined>(BOOMERANG_STORE, "readonly", (store) =>
		store.get(sessionId),
	);
	return row?.blob ?? null;
}

/** Remove a session's stored boomerang GIF Blob. */
export async function deleteBoomerangBlob(sessionId: string): Promise<void> {
	if (typeof indexedDB === "undefined") return;
	await tx(BOOMERANG_STORE, "readwrite", (store) => store.delete(sessionId));
}

function storageKey(sessionId: string): string {
	return `photobooth:${sessionId}`;
}

/** Read the stored session, or null if absent/unparseable. */
export function readPhotoboothSession(sessionId: string): PhotoboothSession | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.sessionStorage.getItem(storageKey(sessionId));
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"shots" in parsed &&
			Array.isArray((parsed as { shots: unknown }).shots)
		) {
			return parsed as PhotoboothSession;
		}
		return null;
	} catch {
		return null;
	}
}

/** Persist the session, replacing any prior value. */
export function writePhotoboothSession(sessionId: string, value: PhotoboothSession): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(storageKey(sessionId), JSON.stringify(value));
	} catch {
		// Quota or private-mode failures are non-fatal; React state still holds the shots.
	}
}

/** Remove the stored session (called once the capture is finalized). Also drops
 * any boomerang GIF Blob held in IndexedDB for this session (fire-and-forget). */
export function clearPhotoboothSession(sessionId: string): void {
	void deleteBoomerangBlob(sessionId);
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(storageKey(sessionId));
	} catch {
		// Ignore.
	}
}
