"use client";

import { useCallback, useEffect, useState } from "react";
import { createPhoto, generatePhotoUploadUrl } from "@/actions/photos";
import {
	countQueuedPhotos,
	getQueuedPhotos,
	type QueuedPhoto,
	removeQueuedPhoto,
} from "@/lib/offline-queue";

/**
 * Uploads one queued photo: presigned S3 PUT, then create the photo record.
 * Mirrors the online path in the result page.
 */
async function syncPhoto(photo: QueuedPhoto): Promise<void> {
	const { uploadUrl, key } = await generatePhotoUploadUrl(photo.eventId);

	const uploaded = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": photo.blob.type || "image/jpeg" },
		body: photo.blob,
	});
	if (!uploaded.ok) {
		throw new Error(`Upload failed with status ${uploaded.status}`);
	}

	await createPhoto({
		eventId: photo.eventId,
		sessionId: photo.sessionId,
		storageKey: key,
		caption: photo.caption,
		templateId: photo.templateId,
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

	const refreshPending = useCallback(async () => {
		try {
			setPending(await countQueuedPhotos());
		} catch {
			// IndexedDB unavailable (e.g. private mode) — nothing to report.
		}
	}, []);

	const sync = useCallback(async () => {
		if (typeof navigator !== "undefined" && !navigator.onLine) return;

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
