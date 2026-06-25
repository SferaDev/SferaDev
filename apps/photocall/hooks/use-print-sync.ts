"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadAndEnqueuePrintJob } from "@/lib/print/index";
import {
	countQueuedPrints,
	getLatestPrintError,
	getQueuedPrints,
	type QueuedPrintJob,
	recordPrintAttempt,
	removeQueuedPrint,
} from "@/lib/print/print-queue";

/**
 * Small pause between jobs while draining the outbox. Hands jobs to the server
 * one at a time with a breather instead of firing a burst of large uploads back
 * to back — the printer prints serially anyway (dye-sub can't interleave), and a
 * congested kiosk Wi-Fi copes far better with spaced requests.
 */
const INTER_JOB_DELAY_MS = 1_000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface UsePrintSyncReturn {
	/** Print jobs still waiting to be enqueued server-side. */
	pending: number;
	/**
	 * Why prints are waiting, when known (e.g. "Could not enqueue the print", "No
	 * printer selected"). Null when nothing is pending or no attempt has failed
	 * yet. Surfaced on the kiosk pending-prints notice.
	 */
	reason: string | null;
	/** Force a sync attempt (also runs on reconnect and on a 30s interval). */
	sync: () => Promise<void>;
}

/**
 * Drains the print outbox to the SERVER-side print queue whenever the kiosk is
 * online — on mount, on the `online` event, and every 30s. Each queued job is
 * re-run through {@link uploadAndEnqueuePrintJob} (upload the held blob to R2,
 * then enqueue a print job for the on-site bridge to claim) — NOT the old direct
 * LAN bridge POST, which is blocked by mixed content on an HTTPS kiosk.
 *
 * No-loss guarantee: a job that fails to enqueue is NEVER dropped. Its attempt
 * counter and last-error are recorded (for backoff telemetry and the pending
 * notice) and it stays in the outbox, retried on every future cycle, until the
 * enqueue succeeds. An offline stretch or a server outage of any length is
 * therefore ridden out and the queue drains automatically once connectivity
 * returns. Safe to mount once on the result page.
 *
 * `enabled` (the resolved bridge URL, or null) only gates whether bridge
 * printing is configured for this event — when null there is no outbox to drain
 * and the notice stays hidden, matching {@link PendingPrints}'s contract.
 */
export function usePrintSync(enabled: string | null | undefined): UsePrintSyncReturn {
	const [pending, setPending] = useState(0);
	const [reason, setReason] = useState<string | null>(null);
	// Guards against concurrent drains. The 30s interval, the `online` event,
	// and mount can overlap a slow in-flight drain; without this, two drains
	// could enqueue the same queued job and the printer would print it twice.
	const draining = useRef(false);

	const refreshPending = useCallback(async () => {
		try {
			const [count, latestError] = await Promise.all([countQueuedPrints(), getLatestPrintError()]);
			setPending(count);
			// Only show a reason while something is actually pending.
			setReason(count > 0 ? latestError : null);
		} catch {
			// IndexedDB unavailable (e.g. private mode) — nothing to report.
		}
	}, []);

	/**
	 * Drain one queued job to the server. On success the job is removed; on
	 * failure it STAYS queued (no-loss) with its attempt count and error recorded
	 * for backoff/telemetry and the pending notice. The stored job is never
	 * mutated, so a failed delivery leaves it queued exactly as captured.
	 */
	const syncJob = useCallback(async (job: QueuedPrintJob): Promise<{ ok: boolean }> => {
		try {
			await uploadAndEnqueuePrintJob(job.blob, job.config, job.photoId);
			await removeQueuedPrint(job.id);
			return { ok: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Could not enqueue the print";
			// Record the failed attempt but KEEP the job: `attempts` counts the
			// deliveries already made, so the just-failed one is the (attempts + 1)-th.
			await recordPrintAttempt(job.id, job.attempts + 1, message);
			return { ok: false };
		}
	}, []);

	const sync = useCallback(async () => {
		if (!enabled) return;
		if (typeof navigator !== "undefined" && !navigator.onLine) return;
		if (draining.current) return;
		draining.current = true;

		try {
			// Snapshot the queue once and process each job AT MOST ONCE this cycle, so
			// a job can never be enqueued twice within a single drain.
			const queued = await getQueuedPrints();
			for (let i = 0; i < queued.length; i++) {
				const job = queued[i];
				if (!job) continue;
				await syncJob(job);
				// Brief pause before the next job (skip after the last one).
				if (i < queued.length - 1) await delay(INTER_JOB_DELAY_MS);
			}
			await refreshPending();
		} finally {
			draining.current = false;
		}
	}, [enabled, refreshPending, syncJob]);

	useEffect(() => {
		void refreshPending();

		const handleOnline = () => {
			void sync();
		};
		window.addEventListener("online", handleOnline);

		// Periodic drain: connectivity may return without an `online` event.
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

	return { pending, reason, sync };
}
