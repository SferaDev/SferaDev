"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	type BridgePrinter,
	listBridgePrinters,
	pingBridge,
	type SubmitResult,
	submitPrintJob,
} from "@/lib/print/bridge-client";
import {
	countQueuedPrints,
	getLatestPrintError,
	getQueuedPrints,
	type QueuedPrintJob,
	recordPrintAttempt,
	removeQueuedPrint,
} from "@/lib/print/print-queue";

/**
 * Small pause between jobs while draining the outbox. Hands jobs to the bridge
 * one at a time with a breather instead of firing a burst of large uploads back
 * to back — the bridge prints serially anyway (dye-sub can't interleave), and a
 * congested kiosk Wi-Fi copes far better with spaced requests.
 */
const INTER_JOB_DELAY_MS = 1_000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * A bridge POST failed because we never reached the bridge at all (vs. the
 * bridge answering with a non-2xx rejection). When the bridge itself is gone we
 * stop the whole drain cycle — the next ping will tell us when it's back —
 * rather than burning through the rest of the queue against a dead host.
 */
function isUnreachable(result: Extract<SubmitResult, { ok: false }>): boolean {
	return result.error === "Could not reach the print bridge";
}

/**
 * Pick the printerId to actually submit a queued job with.
 *
 * A job can be parked with an empty `printPrinterId` (the event had no default
 * printer at capture time) or one that no longer exists on the bridge (the
 * printer was swapped/removed). Submitting it verbatim makes `submitPrintJob`
 * return "No printer selected" forever, so the job stalls in the outbox even
 * when a perfectly good printer is now online.
 *
 * To break that stall we keep the job's own printer when it's still present on
 * the bridge, and otherwise fall back to the first reachable bridge printer.
 * Returns null only when NO printer is reachable — the caller then leaves the
 * job queued (no-loss) for a later cycle.
 */
function resolvePrinterId(
	config: QueuedPrintJob["config"],
	reachablePrinters: BridgePrinter[],
): string | null {
	const stillPresent =
		config.printPrinterId &&
		reachablePrinters.some((printer) => printer.id === config.printPrinterId);
	if (stillPresent) return config.printPrinterId;
	return reachablePrinters[0]?.id ?? null;
}

interface UsePrintSyncReturn {
	/** Print jobs still waiting for a reachable bridge. */
	pending: number;
	/**
	 * Why prints are waiting, when known (e.g. "Could not reach the print
	 * bridge", "Bridge rejected the job (409)"). Null when nothing is pending or
	 * no attempt has failed yet. Surfaced on the kiosk pending-prints notice.
	 */
	reason: string | null;
	/** Force a sync attempt (also runs on reconnect and on a 30s interval). */
	sync: () => Promise<void>;
}

/**
 * Drains the print outbox whenever the configured bridge is reachable — on
 * mount, on the `online` event, and every 30s. Mirrors use-offline-sync.
 *
 * No-loss guarantee: a job that fails to deliver is NEVER dropped. Its attempt
 * counter and last-error are recorded (for backoff telemetry and the pending
 * notice) and it stays in the outbox, retried on every future cycle, until the
 * bridge actually accepts it. An out-of-paper or bridge-down outage of any
 * length is therefore ridden out and the queue drains automatically once the
 * bridge answers again. Safe to mount once on the result page.
 */
export function usePrintSync(bridgeUrl: string | null | undefined): UsePrintSyncReturn {
	const [pending, setPending] = useState(0);
	const [reason, setReason] = useState<string | null>(null);
	// Guards against concurrent drains. The 30s interval, the `online` event,
	// and mount can overlap a slow in-flight drain; without this, two drains
	// could submit the same queued job and the printer would print it twice.
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
	 * Deliver one queued job to the bridge. Returns the bridge result so the
	 * caller can decide whether to keep draining. On success the job is removed;
	 * on failure it STAYS queued (no-loss) with its attempt count and error
	 * recorded for backoff/telemetry and the pending notice.
	 *
	 * The job is re-targeted to a currently-reachable printer before submitting
	 * (see {@link resolvePrinterId}) so a job parked without a valid printer still
	 * drains once any printer is online. We shallow-clone the config with the
	 * resolved id — the stored job is never mutated, so if delivery fails it stays
	 * queued exactly as captured.
	 */
	const syncJob = useCallback(
		async (
			url: string,
			job: QueuedPrintJob,
			reachablePrinters: BridgePrinter[],
		): Promise<SubmitResult> => {
			const printerId = resolvePrinterId(job.config, reachablePrinters);
			// No printer reachable at all: keep the job queued, retry next cycle.
			if (!printerId) {
				const result: SubmitResult = { ok: false, error: "No printer selected" };
				await recordPrintAttempt(job.id, job.attempts + 1, result.error);
				return result;
			}
			const config =
				printerId === job.config.printPrinterId
					? job.config
					: { ...job.config, printPrinterId: printerId };
			const result = await submitPrintJob(url, job.blob, config);
			if (result.ok) {
				await removeQueuedPrint(job.id);
				return result;
			}
			// Record the failed attempt but KEEP the job: `attempts` counts the
			// deliveries already made, so the just-failed one is the (attempts + 1)-th.
			await recordPrintAttempt(job.id, job.attempts + 1, result.error);
			return result;
		},
		[],
	);

	const sync = useCallback(async () => {
		if (!bridgeUrl) return;
		if (typeof navigator !== "undefined" && !navigator.onLine) return;
		if (draining.current) return;
		draining.current = true;

		try {
			// Only drain when the bridge actually answers — avoids hammering a bridge
			// that is simply offline (the jobs stay queued for the next cycle).
			const reachable = await pingBridge(bridgeUrl);
			if (!reachable) return;

			// Fetch the bridge's current printers once per cycle so a job parked
			// without a valid printer can be re-targeted to a reachable one (see
			// resolvePrinterId). A list failure leaves us with no printers, which just
			// means jobs without a usable printer stay queued for the next cycle.
			const printersResult = await listBridgePrinters(bridgeUrl);
			const reachablePrinters = printersResult.ok
				? printersResult.printers.filter((printer) => printer.reachable)
				: [];

			// Snapshot the queue once and process each job AT MOST ONCE this cycle, so
			// a job can never be submitted twice within a single drain.
			const queued = await getQueuedPrints();
			for (let i = 0; i < queued.length; i++) {
				const job = queued[i];
				if (!job) continue;
				const result = await syncJob(bridgeUrl, job, reachablePrinters);
				// Bridge vanished mid-drain: stop now and let the next ping resume.
				// (Jobs are untouched and remain queued — nothing is lost.)
				if (!result.ok && isUnreachable(result)) break;
				// Brief pause before the next job (skip after the last one).
				if (i < queued.length - 1) await delay(INTER_JOB_DELAY_MS);
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

	return { pending, reason, sync };
}
