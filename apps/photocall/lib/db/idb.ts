"use client";

/**
 * Shared IndexedDB plumbing for the kiosk's offline outboxes.
 *
 * Three stores live in the same `photocall-offline` database:
 *  - `pending-photos`   — composited photos awaiting upload (lib/offline-queue.ts)
 *  - `pending-prints`   — print jobs awaiting a reachable print bridge (lib/print)
 *  - `boomerang-blobs`  — the encoded boomerang GIF handed from the capture screen
 *    to the result screen (lib/photobooth-session.ts). A high-res GIF is several
 *    MB — far past sessionStorage's ~5MB string quota — so it travels as a Blob
 *    here, keyed by the kiosk session id, instead of inlined into the session JSON.
 *
 * All stores MUST be created in the same `onupgradeneeded` handler and behind a
 * single DB version. If two modules opened the database at different versions
 * they would race and one would fail to open, so all schema lives here and both
 * features import {@link openDb}.
 */

export const DB_NAME = "photocall-offline";
/**
 * Versions:
 *  - 1 → 2: added the `pending-prints` store alongside `pending-photos`.
 *  - 2 → 3: `pending-photos` items gained the original/processed/raw-shot blob
 *    fields (see lib/offline-queue.ts). No structural migration is needed — the
 *    new fields are optional and legacy single-blob items still sync (their
 *    `blob` is reused as both the original and the processed image) — but the
 *    version is bumped so the stored-shape change is explicit and any future
 *    migration has a hook. The existing object stores are preserved as-is so
 *    items queued under v2 survive the upgrade.
 *  - 3 → 4: added the `boomerang-blobs` store so the (now high-resolution, multi-MB)
 *    boomerang GIF can be carried from capture to result as a Blob — it no longer
 *    fits in sessionStorage. Existing stores are preserved.
 */
export const DB_VERSION = 4;

export const PHOTOS_STORE = "pending-photos";
export const PRINTS_STORE = "pending-prints";
export const BOOMERANG_STORE = "boomerang-blobs";

/**
 * Open (and, if needed, upgrade) the shared offline database. Idempotent —
 * callers should open per-operation and let the connection close on
 * transaction completion via {@link tx}.
 */
export function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			// Guard each create so re-running the upgrade (or upgrading from v1,
			// where only pending-photos existed) never throws.
			if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
				db.createObjectStore(PHOTOS_STORE, { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains(PRINTS_STORE)) {
				db.createObjectStore(PRINTS_STORE, { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains(BOOMERANG_STORE)) {
				db.createObjectStore(BOOMERANG_STORE, { keyPath: "id" });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Run a single request against one object store and resolve with its result.
 * Opens a fresh connection and closes it when the transaction completes.
 */
export function tx<T>(
	store: string,
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	return openDb().then(
		(db) =>
			new Promise<T>((resolve, reject) => {
				const transaction = db.transaction(store, mode);
				const request = run(transaction.objectStore(store));
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
				transaction.onabort = () =>
					reject(transaction.error ?? new Error("IDBTransaction aborted"));
				transaction.oncomplete = () => db.close();
			}),
	);
}
