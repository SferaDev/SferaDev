"use client";

/**
 * Shared IndexedDB plumbing for the kiosk's offline outboxes.
 *
 * Two independent outboxes live in the same `photocall-offline` database:
 *  - `pending-photos`  — composited photos awaiting upload (lib/offline-queue.ts)
 *  - `pending-prints`  — print jobs awaiting a reachable print bridge (lib/print)
 *
 * Both stores MUST be created in the same `onupgradeneeded` handler and behind a
 * single DB version. If two modules opened the database at different versions
 * they would race and one would fail to open, so all schema lives here and both
 * features import {@link openDb}.
 */

export const DB_NAME = "photocall-offline";
/** Bumped 1 → 2 to add the `pending-prints` store alongside `pending-photos`. */
export const DB_VERSION = 2;

export const PHOTOS_STORE = "pending-photos";
export const PRINTS_STORE = "pending-prints";

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
