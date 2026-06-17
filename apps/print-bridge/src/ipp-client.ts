import { promisify } from "node:util";
import type {
	GetPrinterAttributesRequest,
	GetPrinterAttributesResponse,
	IPPVersion,
	MediaSizeName,
	MediaType,
	OrientationRequested,
	Printer,
	PrinterOpertaion,
	PrintJobRequest,
	PrintJobResponse,
} from "ipp";
import ipp from "ipp";
import type { PaperSize, PrintParams, PrintResult } from "./types.js";

/**
 * Thin promise wrapper around williamkapke/ipp (`ipp` v2) tuned for the Canon
 * SELPHY CP-1500 over AirPrint/IPP. The SELPHY is a dye-sublimation photo
 * printer with a few well-known quirks (it sleeps aggressively, is picky about
 * `media-col`, and sometimes only negotiates IPP 1.1) which this module works
 * around — see the mitigations in `printJob`.
 */

const IPP_VERSIONS: readonly IPPVersion[] = ["2.0", "1.1"];

/**
 * Attributes we ask for in every Get-Printer-Attributes call. We request the
 * full `printer-description` group: it includes printer-state, state-reasons,
 * media-supported, copies-supported and the marker (ink/supply) attributes the
 * SELPHY reports, which are not individually keyed in the `ipp` typings.
 */
const REQUESTED_ATTRIBUTES: ["printer-description"] = ["printer-description"];

/**
 * Parsed subset of the printer-attributes-tag. The `ipp` library types this
 * bag as `object`, so we narrow it defensively here rather than casting.
 */
export interface PrinterAttributes {
	state: string;
	stateReasons: string[];
	mediaSupported: string[];
	copiesSupported: number[];
	markerLevels: number[];
	markerNames: string[];
	makeAndModel?: string;
}

/**
 * SELPHY CP-1500 prints 4x6 / postcard on the same dye-sub media, so both map
 * to the `jpn_hagaki_100x148mm` keyword. Other sizes are best-effort: the
 * SELPHY has no native cut media for them, so we still send postcard media and
 * rely on the composited strip already being laid out for that sheet. This is
 * documented in the README.
 */
const PAPER_SIZE_TO_MEDIA: Record<PaperSize, MediaSizeName> = {
	selphy_postcard: "jpn_hagaki_100x148mm",
	"4x6": "jpn_hagaki_100x148mm",
	"5x7": "na_5x7_5x7in",
	"6x8": "na_govt-letter_8x10in",
	"2x6_strip": "jpn_hagaki_100x148mm",
	a4: "iso_a4_210x297mm",
	letter: "na_letter_8.5x11in",
};

/** IPP `media-type` keywords we accept; everything else falls back to glossy photo. */
const IPP_MEDIA_TYPES: readonly MediaType[] = [
	"photographic",
	"photographic-glossy",
	"photographic-high-gloss",
	"photographic-matte",
	"photographic-satin",
	"photographic-semi-gloss",
	"stationery",
	"paper",
];

/**
 * Normalize photocall's media-type config (e.g. `photo_glossy`) into a valid
 * IPP `media-type` keyword. The SELPHY only does glossy dye-sub photo paper, so
 * unknown values default to `photographic-glossy`.
 */
export function normalizeMediaType(value: string | undefined): MediaType {
	if (!value) return "photographic-glossy";
	const direct = IPP_MEDIA_TYPES.find((type) => type === value);
	if (direct) return direct;
	const normalized = value.replace(/_/g, "-").toLowerCase();
	switch (normalized) {
		case "photo-glossy":
		case "glossy":
			return "photographic-glossy";
		case "photo-matte":
		case "matte":
			return "photographic-matte";
		case "photo-satin":
		case "satin":
			return "photographic-satin";
		case "photo":
			return "photographic";
		default:
			return "photographic-glossy";
	}
}

type IppOperation = PrinterOpertaion;

/** Build the `ipp.Printer` execute() as a promise for a given operation. */
function executePrinter<Req, Res>(
	printer: Printer,
	operation: IppOperation,
): (message: Req) => Promise<Res> {
	// `execute` is overloaded across operations; bind to the printer and
	// promisify the (error, response) callback into a typed promise.
	const execute = promisify(printer.execute.bind(printer)) as unknown as (
		operation: IppOperation,
		message: Req,
	) => Promise<Res>;
	return (message: Req) => execute(operation, message);
}

function asStringArray(value: unknown): string[] {
	if (Array.isArray(value)) return value.map((item) => String(item));
	if (value === undefined || value === null) return [];
	return [String(value)];
}

function asNumberArray(value: unknown): number[] {
	if (Array.isArray(value)) {
		return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
	}
	const single = Number(value);
	return Number.isFinite(single) ? [single] : [];
}

/** Narrow the loosely-typed (`object`) printer-attributes-tag bag into our shape. */
function parsePrinterAttributes(response: GetPrinterAttributesResponse): PrinterAttributes {
	// `Object.entries` yields `[string, unknown][]`, letting us read the opaque
	// `object` bag the `ipp` typings expose without casting.
	const bag = new Map<string, unknown>(Object.entries(response["printer-attributes-tag"]));
	const makeAndModel = bag.get("printer-make-and-model");
	const state = bag.get("printer-state");
	return {
		state: typeof state === "string" ? state : "unknown",
		stateReasons: asStringArray(bag.get("printer-state-reasons")),
		mediaSupported: asStringArray(bag.get("media-supported")),
		copiesSupported: asNumberArray(bag.get("copies-supported")),
		markerLevels: asNumberArray(bag.get("marker-levels")),
		markerNames: asStringArray(bag.get("marker-names")),
		makeAndModel: typeof makeAndModel === "string" ? makeAndModel : undefined,
	};
}

/** True when the printer is stopped specifically because it is out of paper. */
export function isOutOfPaper(
	attributes: Pick<PrinterAttributes, "state" | "stateReasons">,
): boolean {
	const reasons = attributes.stateReasons.map((reason) =>
		reason.replace(/-(error|warning|report)$/, ""),
	);
	const mediaBlocked = reasons.includes("media-empty") || reasons.includes("media-needed");
	return mediaBlocked && attributes.state === "stopped";
}

/**
 * Wall-clock timeout for IPP requests. The underlying `ipp` library hands the
 * request straight to `node:http` with no timeout, so an unreachable printer
 * would otherwise hang until the OS TCP timeout (~75s) and block startup /
 * auto-refresh. We bound every call and reject fast instead.
 */
const IPP_REQUEST_TIMEOUT_MS = 8_000;

/** Reject if `promise` does not settle within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
		timer.unref?.();
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

/** Query a printer's current attributes; throws if it is unreachable. */
export async function getPrinterAttributes(
	uri: string,
	version: IPPVersion,
): Promise<PrinterAttributes> {
	const printer = new ipp.Printer(uri, { version });
	const getAttributes = executePrinter<GetPrinterAttributesRequest, GetPrinterAttributesResponse>(
		printer,
		"Get-Printer-Attributes",
	);

	const response = await withTimeout(
		getAttributes({
			"operation-attributes-tag": {
				"requesting-user-name": "photocall-bridge",
				"requested-attributes": [...REQUESTED_ATTRIBUTES],
			},
		}),
		IPP_REQUEST_TIMEOUT_MS,
		"Get-Printer-Attributes",
	);

	return parsePrinterAttributes(response);
}

function orientationKeyword(orientation: PrintParams["orientation"]): OrientationRequested {
	return orientation === "landscape" ? "landscape" : "portrait";
}

function isBadRequest(error: unknown): boolean {
	if (error instanceof Error) {
		return /bad-request|client-error-bad-request/i.test(error.message);
	}
	return false;
}

function isVersionRejected(error: unknown): boolean {
	if (error instanceof Error) {
		return /version-not-supported|server-error-version-not-supported|bad version/i.test(
			error.message,
		);
	}
	return false;
}

/** Build the Print-Job message, optionally with the borderless `media-col`. */
function buildPrintJob(
	imageBuffer: Buffer,
	params: PrintParams,
	useMediaCol: boolean,
): PrintJobRequest {
	const media = PAPER_SIZE_TO_MEDIA[params.paperSize];
	const mediaType = normalizeMediaType(params.mediaType);
	const jobName = `photocall-${Date.now()}`;

	const job: PrintJobRequest["job-attributes-tag"] = {
		copies: params.copies,
		"orientation-requested": orientationKeyword(params.orientation),
		"print-color-mode": "color",
	};

	if (useMediaCol) {
		// Borderless: drop every margin to zero so the dye-sub bleeds to the edge.
		job["media-col"] = params.borderless
			? {
					"media-key": media,
					"media-top-margin": 0,
					"media-bottom-margin": 0,
					"media-left-margin": 0,
					"media-right-margin": 0,
					"media-type": mediaType,
				}
			: { "media-key": media, "media-type": mediaType };
	} else {
		// Reliability fallback: plain `media` keyword (prints with a border but
		// avoids the SELPHY's media-col bad-request quirk).
		job.media = media;
	}

	return {
		"operation-attributes-tag": {
			"requesting-user-name": "photocall-bridge",
			"job-name": jobName,
			"document-format": "image/jpeg",
			"ipp-attribute-fidelity": false,
		},
		"job-attributes-tag": job,
		data: imageBuffer,
	};
}

async function sendPrintJob(
	uri: string,
	version: IPPVersion,
	message: PrintJobRequest,
): Promise<PrintJobResponse> {
	const printer = new ipp.Printer(uri, { version });
	const printJob = executePrinter<PrintJobRequest, PrintJobResponse>(printer, "Print-Job");
	// Bound the data transfer too (not just attribute pings): a printer that
	// stalls mid-transfer would otherwise hold the queue worker until the OS TCP
	// timeout (~75s) and leave the job stuck in "printing".
	return withTimeout(printJob(message), IPP_REQUEST_TIMEOUT_MS, "Print-Job");
}

/**
 * Print a JPEG with the SELPHY reliability mitigations:
 *  1. Wake ping (Get-Printer-Attributes) so the printer is awake and to detect
 *     an out-of-paper condition before we waste a job.
 *  2. Send Print-Job with the borderless `media-col`.
 *  3. On `client-error-bad-request`, retry once with a plain `media` keyword.
 *  4. On version rejection, fall back from IPP 2.0 to 1.1.
 */
export async function printJob(
	uri: string,
	imageBuffer: Buffer,
	params: PrintParams,
	preferredVersion: IPPVersion,
): Promise<PrintResult> {
	const versions = IPP_VERSIONS.includes(preferredVersion)
		? [preferredVersion, ...IPP_VERSIONS.filter((version) => version !== preferredVersion)]
		: IPP_VERSIONS;

	let lastError: unknown;

	for (const version of versions) {
		// (1) Wake ping + out-of-paper guard.
		try {
			const attributes = await getPrinterAttributes(uri, version);
			if (isOutOfPaper(attributes)) {
				throw new Error("Printer is out of paper (media-empty)");
			}
		} catch (error) {
			if (isVersionRejected(error)) {
				lastError = error;
				continue;
			}
			throw error;
		}

		// (2) Borderless media-col attempt.
		try {
			const response = await sendPrintJob(uri, version, buildPrintJob(imageBuffer, params, true));
			return { ippJobId: response["job-attributes-tag"]["job-id"] };
		} catch (error) {
			lastError = error;
			if (isVersionRejected(error)) continue;
			if (!isBadRequest(error)) throw error;

			// (3) media-col rejected → retry once with a plain media keyword.
			console.warn(
				"[ipp] media-col rejected with client-error-bad-request, retrying with plain media keyword",
			);
			const response = await sendPrintJob(uri, version, buildPrintJob(imageBuffer, params, false));
			return {
				ippJobId: response["job-attributes-tag"]["job-id"],
				note: "printed via media keyword fallback (border may be present)",
			};
		}
	}

	throw lastError instanceof Error ? lastError : new Error("Print failed across all IPP versions");
}
