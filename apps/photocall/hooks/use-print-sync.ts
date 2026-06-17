"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pingBridge, submitPrintJob } from "@/lib/print/bridge-client";
import {
	countQueuedPrints,
	getQueuedPrints,
	type QueuedPrintJob,
	removeQueuedPrint,
	updatePrintAttempts,
} from "@/lib/print/print-queue";

/** Give up on a print job after this many failed delivery attempts. */
const MAX_ATTEMPTS = 5;

interface UsePrintSyncReturn {
	/** Print jobs still waiting for a reachable bridge. */
	pending: number;
	/** Force a sync attempt (also runs on reconnect and on a 30s interval). */
	sync: () => Promise<void>;
}

/**
 * Drains the print outbox whenever the configured bridge is reachable — on
 * mount, on the `online` event, and every 30s. Mirrors use-offline-sync. Jobs
 * that fail are retried (attempt counter bumped) and dropped after
 * {@link MAX_ATTEMPTS}. Safe to mount once on the result page.
 */
export function usePrintSync(bridgeUrl: string | null | undefined): UsePrintSyncReturn {
	const [pending, setPending] = useState(0);
	// Guards against concurrent drains. The 30s interval, the `online` event,
	// and mount can overlap a slow in-flight drain; without this, two drains
	// could submit the same queued job and the printer would print it twice.
	const draining = useRef(false);

	const refreshPending = useCallback(async () => {
		try {
			setPending(await countQueuedPrints());
		} catch {
			// IndexedDB unavailable (e.g. private mode) — nothing to report.
		}
	}, []);

	const syncJob = useCallback(async (url: string, job: QueuedPrintJob): Promise<void> => {
		const result = await submitPrintJob(url, job.blob, job.config);
		if (result.ok) {
			await removeQueuedPrint(job.id);
			return;
		}
		// Drop after MAX_ATTEMPTS failed deliveries: `attempts` counts deliveries
		// already made, so the just-failed one is the (attempts + 1)-th.
		const attempts = job.attempts + 1;
		if (attempts >= MAX_ATTEMPTS) {
			await removeQueuedPrint(job.id);
		} else {
			await updatePrintAttempts(job.id, attempts);
		}
	}, []);

	const sync = useCallback(async () => {
		if (!bridgeUrl) return;
		if (typeof navigator !== "undefined" && !navigator.onLine) return;
		if (draining.current) return;
		draining.current = true;

		try {
			// Only drain when the bridge actually answers — avoids burning attempts
			// on a bridge that is simply offline.
			const reachable = await pingBridge(bridgeUrl);
			if (!reachable) return;

			const queued = await getQueuedPrints();
			for (const job of queued) {
				// Drop after MAX_ATTEMPTS failed deliveries: a job that already has
				// MAX_ATTEMPTS recorded has exhausted its retries and is not delivered
				// again. Mirrors the post-failure check in syncJob().
				if (job.attempts >= MAX_ATTEMPTS) {
					await removeQueuedPrint(job.id);
					continue;
				}
				await syncJob(bridgeUrl, job);
			}
			await refreshPending();
		} finally {
			draining.current = false;
		}
	}, [bridgeUrl, refreshPending, syncJob]);

	useEffect(() => {
		void refreshPending();

		const handleOnline = () => {
			void sync();
		};
		window.addEventListener("online", handleOnline);

		// Periodic drain: the bridge may come back without an `online` event
		// (e.g. it restarted while we stayed on WiFi).
		const interval = setInterval(() => {
			void sync();
		}, 30_000);

		// Attempt a drain on mount in case jobs were left from a prior session.
		void sync();

		return () => {
			window.removeEventListener("online", handleOnline);
			clearInterval(interval);
		};
	}, [sync, refreshPending]);

	return { pending, sync };
}
