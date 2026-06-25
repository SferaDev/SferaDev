"use client";

/**
 * Offline outbox for kiosk photo uploads.
 *
 * When the kiosk loses connectivity mid-session, the capture's blobs are held in
 * IndexedDB (which can store Blobs directly) instead of being lost. A background
 * sync — triggered when the browser comes back online — replays the uploads
 * (presigned S3 PUT for each blob) and creates the photo record server-side.
 *
 * Each capture holds (see the feature spec):
 *  - the DECORATED main composite ({@link QueuedPhoto.blob}) — the preview image,
 *    the stored main image (`storageKey`) and what prints;
 *  - the individual RAW shots ({@link QueuedPhoto.rawShotBlobs}) — the full,
 *    uncropped capture frames, viewable and downloadable individually; empty for
 *    boomerangs and undecorated single captures;
 *  - {@link QueuedPhoto.printBlob} is `null` for new items — the main `blob`
 *    already IS the print version, so no separate print object is stored. It is
 *    kept for back-compat: legacy items queued under the old model still carry a
 *    decorated print blob here, and the sync uploads it to `printStorageKey`.
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
	 * The DECORATED main composite blob (the preview/print image): a JPEG for
	 * single/strip captures or an animated GIF for boomerangs. This becomes
	 * `storageKey`.
	 *
	 * Very old legacy items (queued before the original/processed split) only have
	 * this field; the sync treats it as BOTH the main and the print image so those
	 * captures still print correctly after a reconnect.
	 */
	blob: Blob;
	/**
	 * MIME type for {@link blob}. Drives the presigned PUT `Content-Type` and the
	 * stored object's extension. Defaults to image/jpeg when absent (legacy items).
	 */
	contentType?: PhotoContentType;
	/**
	 * Back-compat only. `null` for new items — the main {@link blob} already IS the
	 * print version, so no separate print object is stored (no `printStorageKey`).
	 * Legacy items queued under the old model carry a decorated print composite
	 * here; the sync uploads it to `printStorageKey` so in-flight old items still
	 * sync. (Boomerangs have always set this null.)
	 */
	printBlob?: Blob | null;
	/** MIME type for {@link printBlob}. Defaults to image/jpeg when absent. */
	printContentType?: PhotoContentType;
	/**
	 * The individual RAW shot blobs backing this capture (the full, uncropped
	 * frames), in capture order. Each is uploaded separately; the resulting keys
	 * become `rawShotKeys`. Empty for boomerangs, undecorated single captures, and
	 * legacy items.
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
