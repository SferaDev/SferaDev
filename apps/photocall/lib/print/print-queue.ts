"use client";

/**
 * Offline outbox for print jobs. When the print bridge is unreachable (network
 * blip, bridge restarting), the composited strip is held in IndexedDB and a
 * background sync (hooks/use-print-sync.ts) replays it once the bridge answers.
 *
 * Shares the `photocall-offline` database with the photo outbox; the schema and
 * connection helpers live in lib/db/idb.ts.
 */

import { PRINTS_STORE as STORE, tx } from "@/lib/db/idb";
import type { EventPrintConfig } from "@/lib/print/types";

/**
 * A print job held in the offline outbox.
 *
 * No-loss rule: a job stays here, retried indefinitely (see use-print-sync),
 * until the bridge actually accepts it — running out of paper/ink is common and
 * slow to fix, and a guest's print must never be silently dropped. The only job
 * ever removed without printing is one the bridge permanently rejects as
 * malformed; `attempts` is kept purely for backoff/telemetry, NOT as a give-up
 * threshold.
 */
export interface QueuedPrintJob {
	/** Client-generated id; also the IndexedDB key. */
	id: string;
	/** Composited JPEG strip to print. */
	blob: Blob;
	/** Print configuration resolved from the event at capture time. */
	config: EventPrintConfig;
	/** Epoch millis when queued — used for ordering and display. */
	queuedAt: number;
	/** Delivery attempts so far; drives retry backoff only — jobs are NOT dropped on a cap. */
	attempts: number;
	/**
	 * Why the last delivery attempt failed (e.g. "Could not reach the print
	 * bridge", "Bridge rejected the job (409)"). Surfaced on the kiosk
	 * pending-prints notice so the operator knows WHY prints are waiting.
	 * Undefined before the first failed attempt.
	 */
	lastError?: string;
}

/** Add a print job to the outbox. */
export async function enqueuePrint(job: QueuedPrintJob): Promise<void> {
	await tx(STORE, "readwrite", (store) => store.put(job));
}

/** All queued print jobs, oldest first. */
export async function getQueuedPrints(): Promise<QueuedPrintJob[]> {
	const all = await tx<QueuedPrintJob[]>(STORE, "readonly", (store) => store.getAll());
	return all.sort((a, b) => a.queuedAt - b.queuedAt);
}

/** Remove a print job from the outbox once it has been submitted. */
export async function removeQueuedPrint(id: string): Promise<void> {
	await tx(STORE, "readwrite", (store) => store.delete(id));
}

/** Number of print jobs still awaiting a reachable bridge. */
export async function countQueuedPrints(): Promise<number> {
	if (typeof indexedDB === "undefined") return 0;
	return tx<number>(STORE, "readonly", (store) => store.count());
}

/**
 * Record a failed delivery attempt: bump the attempt counter (for backoff) and
 * capture the reason so the pending-prints notice can explain why prints are
 * waiting. The job stays in the outbox — failures never remove it (no-loss).
 */
export async function recordPrintAttempt(
	id: string,
	attempts: number,
	lastError: string,
): Promise<void> {
	const job = await tx<QueuedPrintJob | undefined>(STORE, "readonly", (store) => store.get(id));
	if (!job) return;
	await tx(STORE, "readwrite", (store) => store.put({ ...job, attempts, lastError }));
}

/**
 * The most recent failure reason across queued jobs, for the pending-prints
 * notice. Returns the newest job's `lastError` (jobs are returned oldest-first,
 * so the last one is the most recently queued). Null when nothing is queued or
 * no attempt has failed yet.
 */
export async function getLatestPrintError(): Promise<string | null> {
	const jobs = await getQueuedPrints();
	for (let i = jobs.length - 1; i >= 0; i--) {
		const reason = jobs[i]?.lastError;
		if (reason) return reason;
	}
	return null;
}
