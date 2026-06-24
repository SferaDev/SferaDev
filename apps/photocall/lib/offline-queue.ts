"use client";

/**
 * Offline outbox for kiosk photo uploads.
 *
 * When the kiosk loses connectivity mid-session, the capture's blobs are held in
 * IndexedDB (which can store Blobs directly) instead of being lost. A background
 * sync — triggered when the browser comes back online — replays the uploads
 * (presigned S3 PUT for each blob) and creates the photo record server-side.
 *
 * Each capture now holds up to three kinds of asset (see the feature spec):
 *  - the unprocessed ORIGINAL ({@link QueuedPhoto.blob}) — the preview image;
 *  - the decorated PROCESSED composite ({@link QueuedPhoto.printBlob}) — used for
 *    printing and offered as a separate download; null for boomerangs/legacy;
 *  - the individual RAW shots ({@link QueuedPhoto.rawShotBlobs}) — viewable and
 *    downloadable individually; empty for boomerangs/legacy.
 *
 * No-loss guarantee: the sync uploads every blob and only calls `createPhoto`
 * (and then removes the item) once all uploads succeed. Any failure leaves the
 * whole item queued for a later retry — the outbox never partially-creates a
 * record or drops a blob.
 *
 * The IndexedDB schema (shared with the print outbox) lives in lib/db/idb.ts so
 * both outboxes open the same database at the same version.
 */

import type { PhotoContentType } from "@/actions/photos";
import { tx as _tx, PHOTOS_STORE as STORE } from "@/lib/db/idb";
import type { PhotoKind } from "@/lib/db/schema";

/** A photo captured offline, awaiting upload + record creation. */
export interface QueuedPhoto {
	/** Client-generated id; also used as the IndexedDB key. */
	id: string;
	eventId: string;
	sessionId: string;
	/**
	 * The unprocessed ORIGINAL blob (the preview image): a JPEG for single/strip
	 * captures or an animated GIF for boomerangs. This becomes `storageKey`.
	 *
	 * Legacy items (queued before the original/processed split) only have this
	 * field; the sync treats it as BOTH the original and the processed image so
	 * those captures still print correctly after a reconnect.
	 */
	blob: Blob;
	/**
	 * MIME type for {@link blob}. Drives the presigned PUT `Content-Type` and the
	 * stored object's extension. Defaults to image/jpeg when absent (legacy items).
	 */
	contentType?: PhotoContentType;
	/**
	 * The decorated/PROCESSED composite blob (all graphic + text layers), uploaded
	 * to `printStorageKey` and used for printing. Null for boomerangs; absent on
	 * legacy items (the sync falls back to {@link blob}).
	 */
	printBlob?: Blob | null;
	/** MIME type for {@link printBlob}. Defaults to image/jpeg when absent. */
	printContentType?: PhotoContentType;
	/**
	 * The individual RAW shot blobs backing this capture, in capture order. Each
	 * is uploaded separately; the resulting keys become `rawShotKeys`. Empty for
	 * boomerangs and legacy items.
	 */
	rawShotBlobs?: Blob[];
	/** MIME type shared by every {@link rawShotBlobs} entry. Defaults to image/jpeg. */
	rawShotContentType?: PhotoContentType;
	caption?: string;
	templateId?: string;
	width: number;
	height: number;
	/** Photobooth: "single", composited "strip", or "boomerang" GIF. */
	kind?: PhotoKind;
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
