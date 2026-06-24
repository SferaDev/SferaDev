"use client";

/**
 * Print dispatcher: turns a composited strip blob + an event's print config
 * into an actual print, choosing the path by `printMethod`:
 *
 *  - `none`   — no-op.
 *  - `manual` — open the browser/AirPrint print dialog (`printImage`). Used on
 *               iPads paired directly to an AirPrint printer, no bridge needed.
 *  - `bridge` — POST the job to the print bridge for silent IPP printing. On a
 *               network failure the job is parked in the offline outbox and
 *               retried by use-print-sync.
 */

import { printImage } from "@/lib/canvas-utils";
import { type Orientation, PAPER_SIZE_MM, type PaperSize } from "@/lib/layout/types";
import { resolveBridgeUrl, submitPrintJob } from "@/lib/print/bridge-client";
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

/** Park a job in the offline outbox for later retry, returning a queued result. */
async function queueForRetry(blob: Blob, config: EventPrintConfig): Promise<PrintDispatchResult> {
	await enqueuePrint({
		id: crypto.randomUUID(),
		blob,
		config,
		queuedAt: Date.now(),
		attempts: 0,
	});
	return { status: "queued", message: "Print bridge unavailable — will retry automatically" };
}

/** Dispatch a print for the composited strip according to the event config. */
export async function executePrint(
	blob: Blob,
	config: EventPrintConfig,
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
			// A blank bridge URL falls back to the mDNS hostname the bridge
			// advertises, so an unconfigured kiosk still reaches a LAN bridge.
			const bridgeUrl = resolveBridgeUrl(config.printBridgeUrl);
			const result = await submitPrintJob(bridgeUrl, blob, config);
			if (result.ok) return { status: "printing", jobId: result.jobId };
			// Network/bridge failure → keep the job for background retry.
			return queueForRetry(blob, config);
		}
	}
}
