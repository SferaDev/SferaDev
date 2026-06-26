import type { ReportedPrinter } from "@/actions/print-jobs";

/**
 * Helpers for interpreting the printers the on-site bridge reports to the cloud
 * (see {@link import("@/actions/print-jobs").listReportedPrinters}). The operator
 * UI no longer pings the LAN bridge directly — presence is derived purely from
 * how recently the bridge last heartbeated a printer.
 */

/**
 * A reported printer counts as "live" only if its last heartbeat is this recent.
 * The bridge heartbeats its printers every ~30s; we allow roughly three missed
 * beats before treating the printer (and, by extension, the bridge) as gone, so a
 * single dropped heartbeat doesn't flap the UI.
 */
export const PRINTER_PRESENCE_TTL_MS = 90_000;

/**
 * Whether the on-site bridge currently has this printer online: the bridge
 * reported it as reachable AND heartbeated recently (so the bridge itself is
 * alive). This replaces the old direct `pingBridge` liveness check.
 */
export function isPrinterOnline(
	printer: Pick<ReportedPrinter, "reachable" | "lastSeenAt">,
): boolean {
	return printer.reachable && Date.now() - printer.lastSeenAt.getTime() < PRINTER_PRESENCE_TTL_MS;
}

/** True when a printer's state reasons indicate it ran out of paper. */
export function isOutOfPaper(printer: Pick<ReportedPrinter, "stateReasons">): boolean {
	const reasons = printer.stateReasons.join(" ").toLowerCase();
	return reasons.includes("media-empty") || reasons.includes("media-needed");
}
