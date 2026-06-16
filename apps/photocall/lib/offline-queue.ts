"use client";

/**
 * Offline outbox for kiosk photo uploads.
 *
 * When the kiosk loses connectivity mid-session, the composited photo is held
 * in IndexedDB (which can store Blobs directly) instead of being lost. A
 * background sync — triggered when the browser comes back online — replays the
 * upload (presigned S3 PUT) and creates the photo record server-side.
 *
 * The IndexedDB schema (shared with the print outbox) lives in lib/db/idb.ts so
 * both outboxes open the same database at the same version.
 */

import { tx as _tx, PHOTOS_STORE as STORE } from "@/lib/db/idb";

/** A photo captured offline, awaiting upload + record creation. */
export interface QueuedPhoto {
	/** Client-generated id; also used as the IndexedDB key. */
	id: string;
	eventId: string;
	sessionId: string;
	/** Composited JPEG, ready to PUT to S3 as-is. */
	blob: Blob;
	caption?: string;
	templateId?: string;
	width: number;
	height: number;
	/** Photobooth: "single" or composited "strip". */
	kind?: "single" | "strip";
	/** JSON array of raw shot URLs backing a composited strip. */
	rawShotsJson?: string;
	/** Filter chosen by the guest/host for this capture. */
	selectedFilter?: string;
	/** Epoch millis when queued — used for display and ordering. */
	queuedAt: number;
}

/** Add a photo to the outbox. */
export async function enqueuePhoto(photo: QueuedPhoto): Promise<void> {
	await _tx(STORE, "readwrite", (store) => store.put(photo));
}

/** All queued photos, oldest first. */
export async function getQueuedPhotos(): Promise<QueuedPhoto[]> {
	const all = await _tx<QueuedPhoto[]>(STORE, "readonly", (store) => store.getAll());
	return all.sort((a, b) => a.queuedAt - b.queuedAt);
}

/** Remove a photo from the outbox once it has been synced. */
export async function removeQueuedPhoto(id: string): Promise<void> {
	await _tx(STORE, "readwrite", (store) => store.delete(id));
}

/** Number of photos still awaiting sync. */
export async function countQueuedPhotos(): Promise<number> {
	if (typeof indexedDB === "undefined") return 0;
	return _tx<number>(STORE, "readonly", (store) => store.count());
}
