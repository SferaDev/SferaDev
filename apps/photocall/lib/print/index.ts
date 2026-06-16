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
import { PAPER_SIZE_MM, type PaperSize } from "@/lib/layout/types";
import { submitPrintJob } from "@/lib/print/bridge-client";
import { enqueuePrint } from "@/lib/print/print-queue";
import type { EventPrintConfig, PrintDispatchResult } from "@/lib/print/types";

/** CSS `@page size` hint (mm) for the manual print dialog, by paper size. */
function pageSizeHint(paperSize: PaperSize | null): string | undefined {
	if (!paperSize) return undefined;
	const { widthMm, heightMm } = PAPER_SIZE_MM[paperSize];
	return `${widthMm}mm ${heightMm}mm`;
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
				await printImage(url, pageSizeHint(config.printPaperSize));
				return { status: "done" };
			} finally {
				// The print window reads the URL on load; revoke shortly after so we
				// don't leak object URLs across many captures.
				setTimeout(() => URL.revokeObjectURL(url), 60_000);
			}
		}

		case "bridge": {
			if (!config.printBridgeUrl) {
				return { status: "failed", message: "No print bridge URL configured" };
			}
			const result = await submitPrintJob(config.printBridgeUrl, blob, config);
			if (result.ok) return { status: "printing", jobId: result.jobId };
			// Network/bridge failure → keep the job for background retry.
			return queueForRetry(blob, config);
		}
	}
}
