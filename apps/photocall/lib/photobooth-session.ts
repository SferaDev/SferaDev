"use client";

import { BOOMERANG_STORE, CAPTURE_SHOTS_STORE, tx } from "@/lib/db/idb";
import type { FilterKind } from "@/lib/layout/types";

/**
 * Client-side, per-session store for the multi-shot capture in progress. The
 * session JSON (filter, optional boomerang dimensions) is small, so it stays in
 * `sessionStorage` keyed by the kiosk session id — synchronous reads/writes are
 * convenient and it survives navigation between the capture and result screens.
 *
 * The bulky pixel data does NOT live in sessionStorage, which has a ~5MB string
 * quota that a high-resolution capture blows past:
 *  - the photo-strip's captured frames (4–6 JPEG data URLs) travel in IndexedDB
 *    via {@link putCaptureShots} / {@link getCaptureShots};
 *  - the boomerang GIF (several MB) travels in IndexedDB via {@link putBoomerangBlob}.
 *
 * Both are keyed by the kiosk session id and read back on the result screen.
 *
 * We store the strip shots as their existing JPEG **data-URL strings** (not as
 * Blobs) deliberately: it keeps the capture filmstrip thumbnails (`<img src>`),
 * the in-memory `shots` state, and the result's `composeStrip` + raw-shot upload
 * paths byte-for-byte unchanged, while still escaping the sessionStorage quota
 * (IndexedDB's quota is far larger). `composeStrip` accepts both data URLs and
 * Blobs, so a future move to Blobs stays an option, but strings are the
 * lower-risk choice that preserves the working compose behavior.
 */

export interface PhotoboothSession {
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

interface CaptureShotsRow {
	id: string;
	/** Captured frames as JPEG data URLs, in slot order. */
	shots: string[];
}

/**
 * Stash the photo-strip's captured frames (JPEG data URLs) in IndexedDB, keyed
 * by the kiosk session id, so the result screen can read them back after
 * navigation. Used instead of sessionStorage because a 4–6 shot high-resolution
 * strip exceeds its ~5MB quota. Replaces any prior set for the session (so an
 * incremental save after each shot, or a retake, overwrites cleanly). No-op when
 * IndexedDB is unavailable. */
export async function putCaptureShots(sessionId: string, shots: string[]): Promise<void> {
	if (typeof indexedDB === "undefined") return;
	await tx(CAPTURE_SHOTS_STORE, "readwrite", (store) =>
		store.put({ id: sessionId, shots } satisfies CaptureShotsRow),
	);
}

/** Read back the photo-strip's captured frames for a session, or null if absent. */
export async function getCaptureShots(sessionId: string): Promise<string[] | null> {
	if (typeof indexedDB === "undefined") return null;
	const row = await tx<CaptureShotsRow | undefined>(CAPTURE_SHOTS_STORE, "readonly", (store) =>
		store.get(sessionId),
	);
	return row?.shots ?? null;
}

/** Remove a session's stored photo-strip frames. */
export async function deleteCaptureShots(sessionId: string): Promise<void> {
	if (typeof indexedDB === "undefined") return;
	await tx(CAPTURE_SHOTS_STORE, "readwrite", (store) => store.delete(sessionId));
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
			"filter" in parsed &&
			typeof (parsed as { filter: unknown }).filter === "string"
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
 * the bulky pixel data held in IndexedDB for this session — the boomerang GIF
 * Blob and the photo-strip frames (both fire-and-forget). */
export function clearPhotoboothSession(sessionId: string): void {
	void deleteBoomerangBlob(sessionId);
	void deleteCaptureShots(sessionId);
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(storageKey(sessionId));
	} catch {
		// Ignore.
	}
}
