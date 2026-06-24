import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PrinterAttributes } from "./ipp-client.js";
import type { DiscoveredPrinter, PrintParams, PrintResult } from "./types.js";

/**
 * A virtual "debug" printer that writes each print job's image to a local
 * folder instead of sending it to a real printer over IPP. It lets the whole
 * print flow (discover → select → submit → job status) be tested end to end
 * without consuming dye-sub media — handy before testing with the real SELPHY.
 *
 * Enabled by setting `BRIDGE_DEBUG_PRINTER_DIR`. The printer is published in the
 * registry like any other, so the photocall kiosk discovers and selects it
 * normally. It is identified by a `file://<dir>` URI: {@link printJob} and
 * {@link getPrinterAttributes} (in ipp-client) short-circuit to this module
 * whenever they see that scheme, so the queue and registry need no changes.
 */

const DEBUG_PRINTER_ID = "debug";
// Presents as a real Canon SELPHY CP1500 so photocall treats it identically; the
// "(Debug)" suffix only marks it in the printer-picker so an operator knows
// nothing is physically printed. The IPP `make-and-model` attribute below is the
// exact string the real printer reports.
const DEBUG_PRINTER_NAME = "Canon SELPHY CP1500 (Debug)";

const FILE_URI_PREFIX = "file://";

/** Build the synthetic URI that marks a printer as the debug file printer. */
function debugPrinterUri(dir: string): string {
	return `${FILE_URI_PREFIX}${dir}`;
}

/** Whether a printer URI addresses the debug file printer rather than IPP. */
export function isDebugPrinterUri(uri: string): boolean {
	return uri.startsWith(FILE_URI_PREFIX);
}

/** Recover the output directory from a debug printer URI. */
export function debugDirFromUri(uri: string): string {
	return uri.slice(FILE_URI_PREFIX.length);
}

/**
 * Attributes the debug printer reports, modelled on a real Canon SELPHY CP1500
 * at idle with a fresh ink/paper cassette, so photocall sees exactly what the
 * physical printer advertises: the CP1500 make/model, its dye-sub media set
 * (Postcard / L / Card), 1–99 copies, and a full colour-ink supply. Returned for
 * every Get-Printer-Attributes since the debug printer is always idle and ready.
 */
export function debugPrinterAttributes(): PrinterAttributes {
	return {
		state: "idle",
		stateReasons: ["none"],
		// The CP1500's dye-sub media keywords (Postcard 100×148, L 89×119, Card 54×86).
		mediaSupported: ["jpn_hagaki_100x148mm", "oe_photo-l_89x119mm", "om_card_54x86mm"],
		copiesSupported: [1, 99],
		// CP1500 ships a combined colour ink + paper cassette; report it full.
		markerLevels: [100],
		markerNames: ["Color Ink/Paper Set"],
		makeAndModel: "Canon SELPHY CP1500",
	};
}

/** Build the {@link DiscoveredPrinter} record for the debug printer. */
export function buildDebugPrinter(dir: string): DiscoveredPrinter {
	const attributes = debugPrinterAttributes();
	return {
		id: DEBUG_PRINTER_ID,
		name: DEBUG_PRINTER_NAME,
		host: "localhost",
		port: 0,
		uri: debugPrinterUri(dir),
		reachable: true,
		lastSeen: Date.now(),
		...attributes,
	};
}

/**
 * "Print" a job by writing its JPEG to the debug folder. Creates the folder on
 * first use. Writes one file per job (copies are logged, not duplicated — the
 * point is to inspect the output, not consume media).
 */
export async function writeDebugPrint(
	dir: string,
	imageBuffer: Buffer,
	params: PrintParams,
): Promise<PrintResult> {
	await mkdir(dir, { recursive: true });
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	const suffix = Math.random().toString(36).slice(2, 8);
	const filename = `photocall-${stamp}-${suffix}.jpg`;
	const path = join(dir, filename);
	await writeFile(path, imageBuffer);
	console.log(
		`[debug-printer] wrote ${imageBuffer.length} bytes → ${path} ` +
			`(copies=${params.copies}, ${params.paperSize}, ${params.orientation}, ` +
			`borderless=${params.borderless})`,
	);
	return { note: `saved to ${path}` };
}
