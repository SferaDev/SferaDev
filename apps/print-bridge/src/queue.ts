import { randomUUID } from "node:crypto";
import type { IPPVersion } from "ipp";
import { printJob } from "./ipp-client.js";
import type { PrinterRegistry } from "./printer-registry.js";
import type { PrintParams, QueuedJob } from "./types.js";

interface PendingWork {
	job: QueuedJob;
	imageBuffer: Buffer;
	params: PrintParams;
}

const MAX_ATTEMPTS = 5;
const BACKOFF_MIN_MS = 5_000;
const BACKOFF_MAX_MS = 60_000;
const HISTORY_LIMIT = 50;

/** Exponential backoff: 5s, 10s, 20s, 40s, capped at 60s. */
function backoffDelay(attempt: number): number {
	return Math.min(BACKOFF_MIN_MS * 2 ** (attempt - 1), BACKOFF_MAX_MS);
}

/**
 * In-memory print queue. Dye-sublimation printers cannot interleave jobs, so
 * exactly one job is sent at a time. Failed jobs are retried with exponential
 * backoff up to {@link MAX_ATTEMPTS} attempts before being marked `failed`.
 */
export class PrintQueue {
	private readonly pending: PendingWork[] = [];
	/** Recent jobs (most recent last), capped at {@link HISTORY_LIMIT}. */
	private readonly history: QueuedJob[] = [];
	private processing = false;
	private retryTimer: NodeJS.Timeout | undefined;

	constructor(
		private readonly registry: PrinterRegistry,
		private readonly ippVersion: IPPVersion,
	) {}

	/** Enqueue a job and kick off processing. Returns the created job record. */
	enqueue(printerId: string, imageBuffer: Buffer, params: PrintParams): QueuedJob {
		const now = Date.now();
		const job: QueuedJob = {
			id: randomUUID(),
			printerId,
			status: "pending",
			attempts: 0,
			createdAt: now,
			updatedAt: now,
		};
		this.pending.push({ job, imageBuffer, params });
		this.recordHistory(job);
		void this.processNext();
		return job;
	}

	get(id: string): QueuedJob | undefined {
		return this.history.find((job) => job.id === id);
	}

	/** Last {@link HISTORY_LIMIT} jobs, most recent first. */
	list(): QueuedJob[] {
		return [...this.history].reverse();
	}

	countPending(): number {
		return this.pending.length + (this.processing ? 1 : 0);
	}

	countFailed(): number {
		return this.history.filter((job) => job.status === "failed").length;
	}

	/** Cancel a still-pending job. Returns false if it is gone or already running. */
	cancel(id: string): boolean {
		const index = this.pending.findIndex((work) => work.job.id === id);
		if (index === -1) return false;
		const [removed] = this.pending.splice(index, 1);
		this.updateJob(removed.job, { status: "failed", error: "Cancelled" });
		return true;
	}

	private recordHistory(job: QueuedJob): void {
		this.history.push(job);
		if (this.history.length > HISTORY_LIMIT) this.history.shift();
	}

	private updateJob(job: QueuedJob, patch: Partial<QueuedJob>): void {
		Object.assign(job, patch, { updatedAt: Date.now() });
	}

	private scheduleRetry(delayMs: number): void {
		if (this.retryTimer) return;
		this.retryTimer = setTimeout(() => {
			this.retryTimer = undefined;
			void this.processNext();
		}, delayMs);
		this.retryTimer.unref?.();
	}

	/** Process the next pending job, one at a time. */
	private async processNext(): Promise<void> {
		if (this.processing) return;
		const work = this.pending[0];
		if (!work) return;

		this.processing = true;
		const { job, imageBuffer, params } = work;
		job.attempts += 1;
		this.updateJob(job, { status: "printing" });

		try {
			const printer = this.registry.get(job.printerId);
			if (!printer) {
				// Printer is gone — drop the job and fall through to the single tail
				// call below. We must NOT recurse here: doing so while the tail call
				// also fires would run two processNext() concurrently and
				// double-dispatch the next job.
				this.pending.shift();
				this.updateJob(job, { status: "failed", error: "Printer not found" });
			} else {
				try {
					const result = await printJob(printer.uri, imageBuffer, params, this.ippVersion);
					this.pending.shift();
					this.updateJob(job, {
						status: "done",
						ippJobId: result.ippJobId,
						note: result.note,
						error: undefined,
					});
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					if (job.attempts >= MAX_ATTEMPTS) {
						this.pending.shift();
						this.updateJob(job, { status: "failed", error: message });
					} else {
						// Leave it at the head of the queue and retry after backoff.
						this.updateJob(job, { status: "pending", error: message });
						this.scheduleRetry(backoffDelay(job.attempts));
					}
				}
			}
		} finally {
			// Reset `processing` in exactly one place so the tail call can proceed.
			this.processing = false;
		}

		// Single dispatch point: continue immediately when the previous job
		// succeeded or was dropped. A scheduled retry will resume on its own timer.
		if (!this.retryTimer) void this.processNext();
	}
}
