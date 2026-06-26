import { z } from "zod";
import type { PrinterRegistry } from "./printer-registry.js";
import type { PrintQueue } from "./queue.js";
import { type JobStatus, paperSizeSchema } from "./types.js";

/**
 * Cloud-pull mode for the print bridge.
 *
 * In addition to the LAN REST API (which always runs), the bridge can poll a
 * photocall server's bridge-facing API for print jobs, print them through the
 * SAME local {@link PrintQueue}, and report status back. This needs no inbound
 * connectivity from the cloud and so sidesteps the mixed-content / firewall
 * problems of the kiosk→bridge LAN path (see README → "Cloud-pull mode").
 *
 * Every cloud call mirrors the resilience of the kiosk's bridge-client: each
 * request is bounded by an AbortController timeout and NEVER throws out of the
 * loop — a failed poll/report just logs and is retried on the next tick. A
 * single bad network moment can never crash the bridge.
 *
 * Status mapping & the claim heartbeat:
 *   - The server claims a job to THIS bridge and expects periodic `printing`
 *     reports as a heartbeat. If it hears none for >5 minutes it assumes the
 *     bridge died and re-queues the job elsewhere. So while a local job is still
 *     pending/printing (including the queue's no-loss retry backoff for
 *     out-of-paper etc.) we keep reporting `printing` on every heartbeat tick.
 *   - Local `done` → cloud `done`; local `failed` → cloud `failed` (with the
 *     error). Both are terminal: we stop tracking the job afterwards.
 *   - A status POST that returns 409 means the job is no longer claimed by us
 *     (re-queued / reassigned / already finished). We stop tracking it — we do
 *     NOT cancel an already-dispatched physical print, we just stop reporting.
 */

/** A print job handed out by the cloud `claim` endpoint. */
const cloudJobSchema = z.object({
	id: z.string().min(1),
	imageUrl: z.string().url(),
	printerId: z.string().min(1),
	paperSize: paperSizeSchema,
	mediaType: z.string().nullable(),
	borderless: z.boolean(),
	copies: z.number().int().min(1),
	orientation: z.enum(["portrait", "landscape"]),
});

type CloudJob = z.infer<typeof cloudJobSchema>;

const claimResponseSchema = z.object({
	jobs: z.array(cloudJobSchema),
});

/** Status keyword reported back to the cloud for a tracked job. */
type CloudJobStatus = "printing" | "done" | "failed" | "queued";

/** Default IPP media-type when the cloud doesn't specify one (matches the LAN route). */
const DEFAULT_MEDIA_TYPE = "photographic-glossy";

const CLAIM_TIMEOUT_MS = 10_000;
const DOWNLOAD_TIMEOUT_MS = 30_000;
const STATUS_TIMEOUT_MS = 8_000;
const PRINTERS_TIMEOUT_MS = 8_000;
/** How many jobs to claim per poll. One dye-sub printer prints serially anyway. */
const CLAIM_LIMIT = 5;
/** Wait this long after a registry change before reporting, to coalesce a burst. */
const REPORT_ON_CHANGE_DEBOUNCE_MS = 750;

/** A job we've claimed and enqueued locally, awaiting its terminal state. */
interface TrackedJob {
	cloudJobId: string;
	localJobId: string;
	/** Last status we successfully reported, to avoid duplicate terminal reports. */
	lastReported?: CloudJobStatus;
}

interface CloudPollerOptions {
	cloudUrl: string;
	pairingToken: string;
	bridgeId: string;
	pollIntervalMs: number;
	heartbeatIntervalMs: number;
	queue: PrintQueue;
	registry: PrinterRegistry;
}

/** fetch() with an AbortController timeout; resolves to null on any failure. */
async function fetchWithTimeout(
	url: string,
	init: RequestInit,
	timeoutMs: number,
): Promise<Response | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Map a local queue status to the status to report to the cloud, or `null` when
 * nothing should be reported (the local job has been evicted from history).
 *
 * `pending` and `printing` both map to cloud `printing`: from the cloud's point
 * of view the job is "in flight on the bridge", and this report doubles as the
 * heartbeat that keeps the claim alive across the queue's no-loss retry backoff.
 */
function mapLocalStatus(local: JobStatus | undefined): CloudJobStatus | null {
	switch (local) {
		case "pending":
		case "printing":
			return "printing";
		case "done":
			return "done";
		case "failed":
			return "failed";
		default:
			// Job no longer in the bounded history (e.g. evicted after 50 newer jobs).
			// Treat as still in flight so the cloud doesn't prematurely re-queue.
			return "printing";
	}
}

export class CloudPoller {
	private readonly opts: CloudPollerOptions;
	/** cloudJobId → tracked job. */
	private readonly tracked = new Map<string, TrackedJob>();
	private pollTimer: NodeJS.Timeout | undefined;
	private heartbeatTimer: NodeJS.Timeout | undefined;
	/** Guards against overlapping poll ticks if a tick runs long. */
	private polling = false;
	private reporting = false;
	/**
	 * Debounce timer for discovery-triggered printer reports. Coalesces the burst
	 * of registry changes when several printers (or both IPP/IPPS transports of one
	 * printer) resolve within a moment of each other into a single report.
	 */
	private reportDebounce: NodeJS.Timeout | undefined;

	constructor(options: CloudPollerOptions) {
		this.opts = options;
	}

	/**
	 * Report printers shortly after the registry changes (a printer is discovered,
	 * refreshed or removed), debounced. Without this, a printer discovered just
	 * after startup waits up to a full heartbeat interval before the dashboard sees
	 * it (the initial report fires before mDNS discovery has resolved anything).
	 */
	private scheduleReportPrinters(): void {
		if (this.reportDebounce) clearTimeout(this.reportDebounce);
		this.reportDebounce = setTimeout(() => {
			this.reportDebounce = undefined;
			void this.reportPrinters();
		}, REPORT_ON_CHANGE_DEBOUNCE_MS);
		this.reportDebounce.unref?.();
	}

	/** Start the poll + heartbeat loops. Both run on `unref`'d timers. */
	start(): void {
		if (this.pollTimer || this.heartbeatTimer) return;
		console.log(
			`[cloud] cloud-pull mode enabled (bridgeId=${this.opts.bridgeId}, poll=${this.opts.pollIntervalMs}ms, heartbeat=${this.opts.heartbeatIntervalMs}ms)`,
		);

		this.pollTimer = setInterval(() => {
			void this.poll();
		}, this.opts.pollIntervalMs);
		this.pollTimer.unref?.();

		this.heartbeatTimer = setInterval(() => {
			void this.reportTrackedJobs();
			void this.reportPrinters();
		}, this.opts.heartbeatIntervalMs);
		this.heartbeatTimer.unref?.();

		// Announce printers promptly so the dashboard sees them without waiting a
		// full heartbeat interval.
		void this.reportPrinters();

		// Re-report (debounced) whenever discovery changes the registry, so a
		// printer found a few seconds after startup shows up within ~1s instead of
		// at the next heartbeat.
		this.opts.registry.setOnChange(() => this.scheduleReportPrinters());
	}

	/** Stop both loops. Safe to call multiple times. */
	stop(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer);
			this.pollTimer = undefined;
		}
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = undefined;
		}
		this.opts.registry.setOnChange(undefined);
		if (this.reportDebounce) {
			clearTimeout(this.reportDebounce);
			this.reportDebounce = undefined;
		}
	}

	private authHeaders(extra?: Record<string, string>): Record<string, string> {
		return { Authorization: `Bearer ${this.opts.pairingToken}`, ...extra };
	}

	private url(path: string): string {
		return `${this.opts.cloudUrl.replace(/\/+$/, "")}${path}`;
	}

	/** One poll tick: claim new jobs, download their images, enqueue them locally. */
	private async poll(): Promise<void> {
		if (this.polling) return;
		this.polling = true;
		try {
			const jobs = await this.claim();
			for (const job of jobs) {
				if (this.tracked.has(job.id)) continue; // already in flight locally
				await this.acceptJob(job);
			}
		} finally {
			this.polling = false;
		}
	}

	/** POST /claim. Returns the validated job list, or [] on any failure. */
	private async claim(): Promise<CloudJob[]> {
		const response = await fetchWithTimeout(
			this.url("/api/bridge/jobs/claim"),
			{
				method: "POST",
				headers: this.authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ bridgeId: this.opts.bridgeId, limit: CLAIM_LIMIT }),
			},
			CLAIM_TIMEOUT_MS,
		);
		if (!response) {
			console.warn("[cloud] claim: could not reach the cloud");
			return [];
		}
		if (!response.ok) {
			console.warn(`[cloud] claim: cloud error (${response.status})`);
			return [];
		}
		try {
			const parsed = claimResponseSchema.parse(await response.json());
			return parsed.jobs;
		} catch (error) {
			console.warn(
				"[cloud] claim: invalid response body:",
				error instanceof Error ? error.message : error,
			);
			return [];
		}
	}

	/** Download a claimed job's image and enqueue it into the local print queue. */
	private async acceptJob(job: CloudJob): Promise<void> {
		const imageBuffer = await this.downloadImage(job.imageUrl);
		if (!imageBuffer) {
			// Couldn't fetch the image bytes — usually a transient R2/network blip or
			// an object that isn't readable yet. Do NOT report `failed`: that is a
			// TERMINAL state on the server and would permanently lose the print on a
			// momentary glitch. Instead leave the job claimed-but-untracked and send
			// no heartbeat for it: the server's stale-claim sweep re-queues it after
			// the heartbeat window, a later claim retries the download, and the
			// server-side attempts cap eventually dead-letters a genuinely unreadable
			// image. (We deliberately don't report `queued` for an immediate re-claim,
			// which would let a hard failure spin claim→download-fail→claim every poll.)
			console.warn(
				`[cloud] job ${job.id}: image download failed; leaving for stale re-queue + retry`,
			);
			return;
		}

		const localJob = this.opts.queue.enqueue(job.printerId, imageBuffer, {
			paperSize: job.paperSize,
			borderless: job.borderless,
			copies: job.copies,
			orientation: job.orientation,
			mediaType: job.mediaType ?? DEFAULT_MEDIA_TYPE,
		});

		this.tracked.set(job.id, { cloudJobId: job.id, localJobId: localJob.id });
		console.log(`[cloud] claimed job ${job.id} → local ${localJob.id} (printer ${job.printerId})`);

		// Report `printing` promptly so the first heartbeat for this job isn't a
		// full interval away (and the cloud sees we've taken it).
		await this.report(job.id, "printing");
	}

	/** Download image bytes from a presigned URL. Resolves to null on any failure. */
	private async downloadImage(imageUrl: string): Promise<Buffer | null> {
		const response = await fetchWithTimeout(imageUrl, { method: "GET" }, DOWNLOAD_TIMEOUT_MS);
		if (!response) {
			console.warn("[cloud] image download failed (unreachable)");
			return null;
		}
		if (!response.ok) {
			console.warn(`[cloud] image download failed (${response.status})`);
			return null;
		}
		try {
			const buffer = Buffer.from(await response.arrayBuffer());
			if (buffer.length === 0) {
				console.warn("[cloud] image download returned 0 bytes");
				return null;
			}
			return buffer;
		} catch (error) {
			console.warn(
				"[cloud] image download: could not read body:",
				error instanceof Error ? error.message : error,
			);
			return null;
		}
	}

	/**
	 * Heartbeat tick for tracked jobs: read each local job's current status and
	 * report it to the cloud. `printing` keeps the claim alive; `done`/`failed`
	 * are reported once and then the job stops being tracked.
	 */
	private async reportTrackedJobs(): Promise<void> {
		if (this.reporting) return;
		this.reporting = true;
		try {
			// Snapshot first: report() mutates `tracked` (on terminal/409), so we
			// can't iterate the live map.
			for (const entry of [...this.tracked.values()]) {
				const local = this.opts.queue.get(entry.localJobId);
				const status = mapLocalStatus(local?.status);
				if (!status) continue;

				if (status === "done" || status === "failed") {
					// Report a terminal status only once.
					if (entry.lastReported === status) {
						this.tracked.delete(entry.cloudJobId);
						continue;
					}
					await this.report(entry.cloudJobId, status, local?.error);
					this.tracked.delete(entry.cloudJobId);
				} else {
					// `printing` — the heartbeat. Send it every tick to refresh the claim.
					await this.report(entry.cloudJobId, status);
				}
			}
		} finally {
			this.reporting = false;
		}
	}

	/**
	 * POST /jobs/:id/status. Updates `lastReported` on success; on 409 stops
	 * tracking the job (the cloud gave it to another bridge). Never throws.
	 */
	private async report(cloudJobId: string, status: CloudJobStatus, error?: string): Promise<void> {
		const body: { bridgeId: string; status: CloudJobStatus; error?: string } = {
			bridgeId: this.opts.bridgeId,
			status,
			...(error ? { error } : {}),
		};
		const response = await fetchWithTimeout(
			this.url(`/api/bridge/jobs/${encodeURIComponent(cloudJobId)}/status`),
			{
				method: "POST",
				headers: this.authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify(body),
			},
			STATUS_TIMEOUT_MS,
		);

		if (!response) {
			// Transient: the next heartbeat tick retries while the local job is alive.
			console.warn(`[cloud] status ${status} for ${cloudJobId}: could not reach the cloud`);
			return;
		}
		if (response.status === 409) {
			// No longer claimed by us — re-queued / reassigned / finished elsewhere.
			// Stop reporting; do NOT cancel an already-dispatched physical print.
			console.warn(`[cloud] job ${cloudJobId} no longer claimed by this bridge (409); untracking`);
			this.tracked.delete(cloudJobId);
			return;
		}
		if (!response.ok) {
			console.warn(`[cloud] status ${status} for ${cloudJobId}: cloud error (${response.status})`);
			return;
		}

		const entry = this.tracked.get(cloudJobId);
		if (entry) entry.lastReported = status;
	}

	/** Register the bridge's discovered printers so the dashboard can list them. */
	private async reportPrinters(): Promise<void> {
		const printers = this.opts.registry.list().map((printer) => ({
			printerId: printer.id,
			name: printer.name,
			makeAndModel: printer.makeAndModel,
			state: printer.state,
			stateReasons: printer.stateReasons,
			markerLevels: printer.markerLevels,
			mediaSupported: printer.mediaSupported,
			reachable: printer.reachable,
		}));

		const response = await fetchWithTimeout(
			this.url("/api/bridge/printers"),
			{
				method: "POST",
				headers: this.authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ printers }),
			},
			PRINTERS_TIMEOUT_MS,
		);
		if (!response) {
			console.warn("[cloud] printers: could not reach the cloud");
			return;
		}
		if (!response.ok) {
			console.warn(`[cloud] printers: cloud error (${response.status})`);
		}
	}
}
