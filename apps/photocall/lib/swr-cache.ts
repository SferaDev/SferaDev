"use client";

import type { Cache, State } from "swr";

/**
 * A localStorage-backed SWR cache provider.
 *
 * Persisting the SWR cache means data fetched while online (the public event,
 * its templates, recent slideshow photos) is still available after a reload or
 * when the kiosk is offline — so the booth keeps rendering real content through
 * network drops instead of falling back to "event not found".
 *
 * Only successful data is persisted; errors and in-flight promises are dropped.
 */

const STORAGE_KEY = "photocall-swr-cache";

export function createPersistentCache(): Cache {
	const map = new Map<string, State>();

	if (typeof window !== "undefined") {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY);
			if (saved) {
				for (const [key, value] of Object.entries(JSON.parse(saved) as Record<string, unknown>)) {
					map.set(key, { data: value } as State);
				}
			}
		} catch {
			// Corrupt or unavailable storage — start with an empty cache.
		}

		const persist = () => {
			try {
				const serializable: Record<string, unknown> = {};
				for (const [key, value] of map.entries()) {
					if (value?.data !== undefined && value.error === undefined) {
						serializable[key] = value.data;
					}
				}
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
			} catch {
				// Quota exceeded or storage blocked — caching is best-effort.
			}
		};

		// Flush on tab hide/unload so the latest data survives a reload/offline.
		window.addEventListener("beforeunload", persist);
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") persist();
		});
	}

	return map as unknown as Cache;
}
