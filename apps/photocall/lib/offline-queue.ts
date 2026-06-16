"use client";

/**
 * Offline outbox for kiosk photo uploads.
 *
 * When the kiosk loses connectivity mid-session, the composited photo is held
 * in IndexedDB (which can store Blobs directly) instead of being lost. A
 * background sync — triggered when the browser comes back online — replays the
 * upload (presigned S3 PUT) and creates the photo record server-side.
 *
 * IndexedDB is used directly (no dependency) to keep the kiosk bundle small and
 * avoid pulling a wrapper for the handful of operations we need.
 */

const DB_NAME = "photocall-offline";
const DB_VERSION = 1;
const STORE = "pending-photos";

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

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: "id" });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function tx<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	return openDb().then(
		(db) =>
			new Promise<T>((resolve, reject) => {
				const transaction = db.transaction(STORE, mode);
				const request = run(transaction.objectStore(STORE));
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
				transaction.oncomplete = () => db.close();
			}),
	);
}

/** Add a photo to the outbox. */
export async function enqueuePhoto(photo: QueuedPhoto): Promise<void> {
	await tx("readwrite", (store) => store.put(photo));
}

/** All queued photos, oldest first. */
export async function getQueuedPhotos(): Promise<QueuedPhoto[]> {
	const all = await tx<QueuedPhoto[]>("readonly", (store) => store.getAll());
	return all.sort((a, b) => a.queuedAt - b.queuedAt);
}

/** Remove a photo from the outbox once it has been synced. */
export async function removeQueuedPhoto(id: string): Promise<void> {
	await tx("readwrite", (store) => store.delete(id));
}

/** Number of photos still awaiting sync. */
export async function countQueuedPhotos(): Promise<number> {
	if (typeof indexedDB === "undefined") return 0;
	return tx<number>("readonly", (store) => store.count());
}
