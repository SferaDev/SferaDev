import type { Orientation, PaperSize } from "@/lib/layout/types";

/** How an event prints its composited strips. Matches the `events` schema. */
export type PrintMethod = "none" | "bridge" | "manual";

/**
 * Resolved print configuration for an event, derived from the `print*` columns
 * on the `events` table (see lib/db/schema.ts). The kiosk passes this to
 * {@link executePrint}.
 */
export interface EventPrintConfig {
	/**
	 * The event this print belongs to. Required for `bridge` mode: the kiosk
	 * uploads the image to R2 and enqueues a server-side print job scoped to this
	 * event (see {@link import("./index").executePrint}). Empty for the
	 * `manual`/`none` paths and the dashboard test-print, which never enqueue.
	 */
	eventId: string;
	/** `none` (no printing), `bridge` (auto network), `manual` (AirPrint dialog). */
	printMethod: PrintMethod;
	/** Base URL of the print bridge, e.g. `http://pi.local:3200` (bridge mode). */
	printBridgeUrl: string | null;
	/** Discovered printer id to target on the bridge. */
	printPrinterId: string | null;
	printPaperSize: PaperSize | null;
	printMediaType: string | null;
	printBorderless: boolean;
	printCopies: number;
	printOrientation: Orientation;
	/** Whether to print automatically once the strip is composed. */
	printAutoPrint: boolean;
}

/** Lifecycle of a print request as surfaced to the result page UI. */
export type PrintJobStatus = "idle" | "printing" | "done" | "failed" | "queued";

/** Result of a single {@link executePrint} dispatch. */
export interface PrintDispatchResult {
	status: Exclude<PrintJobStatus, "idle">;
	/** Bridge job id, when the bridge accepted the job. */
	jobId?: string;
	/** Human-readable reason for `failed` / `queued`. */
	message?: string;
}
