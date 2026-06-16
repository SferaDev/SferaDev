"use client";

import { useCallback, useEffect, useState } from "react";
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

		// Only drain when the bridge actually answers — avoids burning attempts
		// on a bridge that is simply offline.
		const reachable = await pingBridge(bridgeUrl);
		if (!reachable) return;

		const queued = await getQueuedPrints();
		for (const job of queued) {
			if (job.attempts >= MAX_ATTEMPTS) {
				await removeQueuedPrint(job.id);
				continue;
			}
			await syncJob(bridgeUrl, job);
		}
		await refreshPending();
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
