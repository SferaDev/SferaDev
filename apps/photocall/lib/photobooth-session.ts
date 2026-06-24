"use client";

import type { FilterKind } from "@/lib/layout/types";

/**
 * Client-side, per-session store for the multi-shot capture in progress. Shots
 * are persisted in `sessionStorage` (keyed by the kiosk session id) so they
 * survive navigation between the capture and result screens and work fully
 * offline — this is the source of truth, with the server `saveMultiCapture`
 * call being best-effort.
 */

export interface PhotoboothSession {
	/** Captured frames as JPEG data URLs, in slot order. Empty for boomerangs,
	 * whose single "shot" is the encoded GIF held in {@link boomerangGif}. */
	shots: string[];
	/** Filter chosen by the guest/host for the whole strip. */
	filter: FilterKind;
	/**
	 * The fully decorated + filtered boomerang as an `image/gif` data URL, written
	 * by the capture screen so the result screen can upload it without re-encoding.
	 * Present only for the boomerang capture path; absent for photo strips.
	 */
	boomerangGif?: string;
	/** Pixel dimensions of {@link boomerangGif}, needed for the photo record. */
	boomerangWidth?: number;
	boomerangHeight?: number;
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

/** Remove the stored session (called once the strip is finalized). */
export function clearPhotoboothSession(sessionId: string): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(storageKey(sessionId));
	} catch {
		// Ignore.
	}
}
