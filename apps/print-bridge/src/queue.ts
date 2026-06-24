import { randomUUID } from "node:crypto";
import type { IPPVersion } from "ipp";
import { classifyPrintError, printJob } from "./ipp-client.js";
import type { PrinterRegistry } from "./printer-registry.js";
import type { PrintParams, QueuedJob } from "./types.js";

interface PendingWork {
	job: QueuedJob;
	imageBuffer: Buffer;
	params: PrintParams;
}

const BACKOFF_MIN_MS = 5_000;
const BACKOFF_MAX_MS = 60_000;
const HISTORY_LIMIT = 50;

/**
 * Exponential backoff capped at 60s: 5s, 10s, 20s, 40s, 60s, 60s, … Because
 * retryable jobs are NEVER dropped (see below), the cap matters — without it the
 * delay would grow unbounded over a long outage and a refilled printer could sit
 * idle for minutes before the next attempt. Capped at 60s, a job resumes within
 * a minute of the printer coming back.
 */
function backoffDelay(attempt: number): number {
	return Math.min(BACKOFF_MIN_MS * 2 ** (attempt - 1), BACKOFF_MAX_MS);
}

/**
 * In-memory print queue. Dye-sublimation printers cannot interleave jobs, so
 * exactly one job is sent at a time.
 *
 * No-loss guarantee: a retryable failure (printer out of paper/ink, unreachable,
 * asleep, transient reject — see {@link classifyPrintError}) is NEVER dropped. It
 * stays at the head of the queue and is retried with capped exponential backoff
 * indefinitely, so an out-of-paper outage of any length is ridden out and the
 * queue drains by itself the moment the printer is refilled. Only a genuinely
 * permanent fault — a malformed job the printer will never accept (e.g.
 * unsupported document format) — is marked `failed` and removed; everything else
 * waits for the printer to recover.
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
		// A retry is already scheduled: the head job failed and is waiting out its
		// backoff. Let that timer be the sole driver until it fires — otherwise a
		// job enqueued mid-backoff would pick the failed head job up immediately,
		// skipping the backoff and burning a retry attempt early.
		if (this.retryTimer) return;
		const work = this.pending[0];
		if (!work) return;

		this.processing = true;
		const { job, imageBuffer, params } = work;
		job.attempts += 1;
		this.updateJob(job, { status: "printing" });

		try {
			const printer = this.registry.get(job.printerId);
			if (!printer) {
				// The printer isn't in the registry right now. This is usually
				// TRANSIENT — an mDNS-discovered printer can briefly drop off during a
				// re-discovery, or a manual printer may not have been re-seeded yet
				// after a bridge restart. No-loss rule: keep the job at the head and
				// retry rather than dropping it, so it prints once the printer is back.
				// We must NOT recurse here: doing so while the tail call also fires
				// would run two processNext() concurrently and double-dispatch.
				this.updateJob(job, {
					status: "pending",
					error: "Printer not found (waiting for it to reappear)",
				});
				this.scheduleRetry(backoffDelay(job.attempts));
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
					const classified = classifyPrintError(error);
					if (!classified.retryable) {
						// Genuinely permanent (e.g. unsupported document format): the
						// printer will never accept this exact job, so retrying forever is
						// pointless. Drop it — the ONLY case where a job leaves the queue
						// without printing.
						this.pending.shift();
						this.updateJob(job, { status: "failed", error: classified.message });
					} else {
						// Retryable outage (out of paper/ink, unreachable, asleep,
						// transient reject). No-loss: leave the job at the HEAD of the
						// queue and retry after capped backoff — indefinitely, however
						// long the outage lasts. It drains automatically on recovery.
						this.updateJob(job, { status: "pending", error: classified.message });
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
