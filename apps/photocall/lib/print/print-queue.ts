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

/** A print job captured while the bridge was unreachable. */
export interface QueuedPrintJob {
	/** Client-generated id; also the IndexedDB key. */
	id: string;
	/** Composited JPEG strip to print. */
	blob: Blob;
	/** Print configuration resolved from the event at capture time. */
	config: EventPrintConfig;
	/** Epoch millis when queued — used for ordering and display. */
	queuedAt: number;
	/** Delivery attempts so far; jobs are dropped after 5 (see use-print-sync). */
	attempts: number;
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

/** Increment the attempt counter for a queued job (after a failed sync). */
export async function updatePrintAttempts(id: string, attempts: number): Promise<void> {
	const job = await tx<QueuedPrintJob | undefined>(STORE, "readonly", (store) => store.get(id));
	if (!job) return;
	await tx(STORE, "readwrite", (store) => store.put({ ...job, attempts }));
}
