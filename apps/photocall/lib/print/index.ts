"use client";

/**
 * Print dispatcher: turns a composited strip blob + an event's print config
 * into an actual print, choosing the path by `printMethod`:
 *
 *  - `none`   — no-op.
 *  - `manual` — open the browser/AirPrint print dialog (`printImage`). Used on
 *               iPads paired directly to an AirPrint printer, no bridge needed.
 *  - `bridge` — upload the image to R2 and enqueue a SERVER-side print job. The
 *               on-site bridge polls the server outbound, claims the job and
 *               prints it — so this works even on an HTTPS kiosk that can't reach
 *               a plain-HTTP LAN bridge (mixed content). On a network/server
 *               failure the job is parked in the offline outbox (carrying the
 *               blob + config so the retry can re-run upload→enqueue) and drained
 *               by use-print-sync.
 */

import { generatePhotoUploadUrl } from "@/actions/photos";
import { enqueuePrintJob } from "@/actions/print-jobs";
import { printImage } from "@/lib/canvas-utils";
import { type Orientation, PAPER_SIZE_MM, type PaperSize } from "@/lib/layout/types";
import { enqueuePrint } from "@/lib/print/print-queue";
import type { EventPrintConfig, PrintDispatchResult } from "@/lib/print/types";

/**
 * CSS `@page size` hint (mm) for the manual print dialog. PAPER_SIZE_MM stores
 * portrait dimensions (width ≤ height); for a landscape job (e.g. the 2-up
 * tiled strip sheet) we swap so the page matches the rendered image — otherwise
 * a landscape image gets contained into a portrait page and prints shrunk.
 */
function pageSizeHint(paperSize: PaperSize | null, orientation?: Orientation): string | undefined {
	if (!paperSize) return undefined;
	const { widthMm, heightMm } = PAPER_SIZE_MM[paperSize];
	const shortMm = Math.min(widthMm, heightMm);
	const longMm = Math.max(widthMm, heightMm);
	const [w, h] = orientation === "landscape" ? [longMm, shortMm] : [shortMm, longMm];
	return `${w}mm ${h}mm`;
}

/**
 * Park a job in the offline outbox for later retry, returning a queued result.
 *
 * `reason` records WHY the immediate attempt didn't enqueue — typically the
 * upload or the server action failed (offline, server down). The blob + config
 * are stored so use-print-sync can re-run the full upload→enqueue on each retry.
 * The job is queued (no-loss) and the reason is surfaced on the kiosk
 * pending-prints notice, replaced on each retry.
 */
async function queueForRetry(
	blob: Blob,
	config: EventPrintConfig,
	reason: string,
	photoId?: string,
): Promise<PrintDispatchResult> {
	await enqueuePrint({
		id: crypto.randomUUID(),
		blob,
		config,
		photoId,
		queuedAt: Date.now(),
		attempts: 0,
		lastError: reason,
	});
	return { status: "queued", message: reason };
}

/**
 * Upload a print-ready blob to R2 (presigned PUT) and enqueue a server-side
 * print job for the on-site bridge to claim. Shared by the live kiosk dispatch
 * and the offline-outbox drain so both go through the exact same path.
 *
 * Throws on any failure (no usable printer, upload rejected, enqueue failed) so
 * the caller can park the job for retry. The image bytes go straight to R2 via
 * the presigned PUT — never through the Server Action body.
 */
export async function uploadAndEnqueuePrintJob(
	blob: Blob,
	config: EventPrintConfig,
	photoId?: string,
): Promise<{ jobId: string }> {
	if (!config.printPrinterId) throw new Error("No printer selected");
	if (!config.printPaperSize) throw new Error("No paper size configured");

	const { uploadUrl, key } = await generatePhotoUploadUrl(config.eventId, "image/jpeg");
	const uploaded = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": "image/jpeg" },
		body: blob,
	});
	// fetch only rejects on network errors, so a non-2xx PUT would otherwise
	// "succeed" and enqueue a job pointing at a failed object — treat it as a
	// failure so the offline outbox retries the whole upload→enqueue.
	if (!uploaded.ok) throw new Error(`Upload failed with status ${uploaded.status}`);

	return enqueuePrintJob({
		eventId: config.eventId,
		imageStorageKey: key,
		printerId: config.printPrinterId,
		paperSize: config.printPaperSize,
		mediaType: config.printMediaType ?? undefined,
		borderless: config.printBorderless,
		copies: config.printCopies,
		orientation: config.printOrientation,
		photoId,
	});
}

/**
 * Dispatch a print for the composited strip according to the event config.
 * `photoId` associates a `bridge` job with its originating photo when known
 * (optional — auto-print can fire before the photo record is created).
 */
export async function executePrint(
	blob: Blob,
	config: EventPrintConfig,
	photoId?: string,
): Promise<PrintDispatchResult> {
	switch (config.printMethod) {
		case "none":
			return { status: "done" };

		case "manual": {
			const url = URL.createObjectURL(blob);
			try {
				await printImage(url, pageSizeHint(config.printPaperSize, config.printOrientation));
				return { status: "done" };
			} finally {
				// The print window reads the URL on load; revoke shortly after so we
				// don't leak object URLs across many captures.
				setTimeout(() => URL.revokeObjectURL(url), 60_000);
			}
		}

		case "bridge": {
			// Without a target printer we can't enqueue (the schema requires a
			// printerId). Park the job so it's never lost rather than enqueue a job
			// with no printer; the picker auto-selects the sole reachable printer, so
			// this is the rare "no printer configured at capture time" case.
			if (!config.printPrinterId) {
				return queueForRetry(blob, config, "No printer selected", photoId);
			}
			try {
				// Upload the image to R2 and enqueue a server-side job. The on-site
				// bridge claims it from the server outbound and prints — so this works
				// on an HTTPS kiosk that can't reach a plain-HTTP LAN bridge.
				const { jobId } = await uploadAndEnqueuePrintJob(blob, config, photoId);
				// The job is durably queued server-side. That hand-off is the success
				// the kiosk can confirm (it can't track the physical print), so report
				// "done" (green positive feedback) rather than a spinner that never
				// resolves — the dashboard queue tracks the rest of the lifecycle.
				return { status: "done", jobId };
			} catch (error) {
				// Offline or server failure: park the blob + config in the outbox
				// (no-loss) so use-print-sync can re-run upload→enqueue on the next
				// cycle. The reason is surfaced on the pending-prints notice.
				const reason = error instanceof Error ? error.message : "Could not enqueue the print";
				return queueForRetry(blob, config, reason, photoId);
			}
		}
	}
}
