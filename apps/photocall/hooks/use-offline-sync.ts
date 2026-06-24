"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPhoto, generatePhotoUploadUrl, type PhotoContentType } from "@/actions/photos";
import {
	countQueuedPhotos,
	getQueuedPhotos,
	type QueuedPhoto,
	removeQueuedPhoto,
} from "@/lib/offline-queue";

/**
 * Upload a single blob to R2 via a freshly-minted presigned PUT and return its
 * storage key. Throws on any network/HTTP failure so the caller can abort the
 * whole sync and leave the item queued for a later retry.
 */
async function uploadBlob(
	eventId: string,
	blob: Blob,
	contentType: PhotoContentType,
): Promise<string> {
	const { uploadUrl, key } = await generatePhotoUploadUrl(eventId, contentType);
	const uploaded = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": blob.type || contentType },
		body: blob,
	});
	if (!uploaded.ok) {
		throw new Error(`Upload failed with status ${uploaded.status}`);
	}
	return key;
}

/**
 * Uploads one queued photo and creates its record. Mirrors the online path in
 * the result page: original → `storageKey`, processed → `printStorageKey`, and
 * each raw shot → an entry in `rawShotKeys`.
 *
 * No-loss guarantee on partial failure: every blob is uploaded FIRST; only once
 * all uploads (and `createPhoto`) succeed is the item removed from the outbox.
 * If any upload or the record creation throws, this function rethrows WITHOUT
 * removing the item, so the next sync retries the entire capture. A retry may
 * re-upload blobs (orphaning the earlier objects), but it never drops a photo or
 * leaves a record pointing at a half-uploaded asset.
 */
async function syncPhoto(photo: QueuedPhoto): Promise<void> {
	const contentType = photo.contentType ?? "image/jpeg";

	// 1. Original (preview image).
	const storageKey = await uploadBlob(photo.eventId, photo.blob, contentType);

	// 2. Processed/print composite. Legacy items have no `printBlob` — reuse the
	//    original so those captures still print. Boomerangs explicitly set it null.
	const printContentType = photo.printContentType ?? contentType;
	let printStorageKey: string | undefined;
	if (photo.printBlob === undefined) {
		// Legacy single-blob item: the original doubles as the processed image.
		printStorageKey = storageKey;
	} else if (photo.printBlob !== null) {
		printStorageKey = await uploadBlob(photo.eventId, photo.printBlob, printContentType);
	}

	// 3. Individual raw shots.
	const rawShotContentType = photo.rawShotContentType ?? "image/jpeg";
	const rawShotKeys: string[] = [];
	for (const shot of photo.rawShotBlobs ?? []) {
		rawShotKeys.push(await uploadBlob(photo.eventId, shot, rawShotContentType));
	}

	await createPhoto({
		eventId: photo.eventId,
		sessionId: photo.sessionId,
		storageKey,
		printStorageKey,
		rawShotKeys: rawShotKeys.length > 0 ? JSON.stringify(rawShotKeys) : undefined,
		caption: photo.caption,
		templateId: photo.templateId,
		kind: photo.kind,
		rawShotsJson: photo.rawShotsJson,
		width: photo.width,
		height: photo.height,
		sizeBytes: photo.blob.size,
	});

	await removeQueuedPhoto(photo.id);
}

interface UseOfflineSyncReturn {
	/** Whether the browser currently has connectivity. */
	online: boolean;
	/** Photos still waiting to upload. */
	pending: number;
	/** Force a sync attempt (also runs automatically on reconnect). */
	sync: () => Promise<void>;
}

/**
 * Drains the offline photo outbox whenever the device is online — on mount, on
 * the `online` event, and on demand. Safe to mount once near the kiosk root.
 */
export function useOfflineSync(): UseOfflineSyncReturn {
	const [online, setOnline] = useState(true);
	const [pending, setPending] = useState(0);
	// Guards against concurrent drains. Mount, the `online` event, the service
	// worker message, and manual retries can all fire close together; without
	// this, two drains could read the same queued photo before either removes
	// it and upload it twice (duplicate gallery entry + double usage metering).
	const draining = useRef(false);

	const refreshPending = useCallback(async () => {
		try {
			setPending(await countQueuedPhotos());
		} catch {
			// IndexedDB unavailable (e.g. private mode) — nothing to report.
		}
	}, []);

	const sync = useCallback(async () => {
		if (typeof navigator !== "undefined" && !navigator.onLine) return;
		if (draining.current) return;
		draining.current = true;

		try {
			const queued = await getQueuedPhotos();
			for (const photo of queued) {
				try {
					await syncPhoto(photo);
				} catch {
					// Leave the item in the queue and stop; a later online event or
					// manual retry will pick it back up.
					break;
				}
			}
			await refreshPending();
		} finally {
			draining.current = false;
		}
	}, [refreshPending]);

	useEffect(() => {
		setOnline(navigator.onLine);
		void refreshPending();

		// Ensure the kiosk's app-shell service worker is registered so the booth
		// keeps loading through network drops once it has been opened.
		navigator.serviceWorker?.register?.("/sw.js").catch(() => {
			// Registration is best-effort; offline sync still works without it.
		});

		const handleOnline = () => {
			setOnline(true);
			void sync();
		};
		const handleOffline = () => setOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Service worker can request a flush after a background sync wakeup.
		const handleMessage = (event: MessageEvent) => {
			if (event.data?.type === "photocall-sync") void sync();
		};
		navigator.serviceWorker?.addEventListener?.("message", handleMessage);

		// Attempt a drain on mount in case items were left from a prior session.
		void sync();

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			navigator.serviceWorker?.removeEventListener?.("message", handleMessage);
		};
	}, [sync, refreshPending]);

	return { online, pending, sync };
}
