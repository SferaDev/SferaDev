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
import {
	debugDirFromUri,
	debugPrinterAttributes,
	isDebugPrinterUri,
	writeDebugPrint,
} from "./debug-printer.js";
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

/**
 * Print-Job needs a MUCH longer bound than a quick attribute ping: it transfers
 * the full multi-MB JPEG and waits for the printer to ACCEPT the job, which on a
 * real SELPHY over congested event Wi-Fi can take far longer than 8s. With the
 * old 8s bound, a slow-but-SUCCESSFUL accept timed out → the no-loss queue
 * retried → the SELPHY printed the same photo TWICE. Two minutes comfortably
 * covers a slow accept while still bounding a genuinely dead transfer (a truly
 * unreachable printer still fails fast at the TCP layer well before this).
 */
const PRINT_JOB_TIMEOUT_MS = 120_000;

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
	// The debug file printer has no IPP endpoint — it is always idle and ready.
	if (isDebugPrinterUri(uri)) return debugPrinterAttributes();

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

/**
 * A print failure tagged with whether the queue should keep retrying it.
 *
 * The product rule is no-loss: running out of paper/ink or losing the printer
 * on the LAN is COMMON and slow to fix, so those jobs must retry forever until
 * they actually print. Only a genuinely permanent fault (a malformed job the
 * printer will never accept no matter how long we wait) is non-retryable and may
 * be dropped. Almost everything an IPP printer throws — out-of-paper, asleep,
 * unreachable, transient reject — is therefore retryable by default.
 */
export class PrintJobError extends Error {
	constructor(
		message: string,
		/** When false, the queue may stop retrying and mark the job failed. */
		readonly retryable: boolean,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "PrintJobError";
	}
}

/**
 * The printer ran out of paper/ink. The single most common event-day outage and
 * the one the product owner explicitly wants to ride out: keep the job queued
 * and retrying until the operator refills, then it drains on its own.
 */
export class OutOfPaperError extends PrintJobError {
	constructor() {
		super("Printer is out of paper (media-empty)", true);
		this.name = "OutOfPaperError";
	}
}

/**
 * Classify an arbitrary thrown value into a {@link PrintJobError}. We retry by
 * DEFAULT (no-loss): a failure we cannot positively identify as permanent is
 * treated as a transient outage worth waiting out. Only a `document-format` /
 * unsupported-media-type style rejection — the printer telling us the JOB ITSELF
 * is malformed, which will never succeed on retry — is marked non-retryable.
 */
export function classifyPrintError(error: unknown): PrintJobError {
	if (error instanceof PrintJobError) return error;
	const message = error instanceof Error ? error.message : String(error);
	// A document-format / unsupported-media-type rejection means the printer will
	// never accept this exact job — retrying would loop forever to no effect, so
	// drop it. Everything else (unreachable, timeout, busy, generic reject) is a
	// transient condition we keep retrying through.
	const permanent =
		/document-format-not-supported|client-error-document-format|unsupported-media-type|client-error-attributes-or-values-not-supported/i.test(
			message,
		);
	return new PrintJobError(message, !permanent, { cause: error });
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
	// Bound the data transfer with the generous Print-Job timeout (NOT the short
	// attribute-ping one): a successful-but-slow accept must not time out, or the
	// no-loss queue would retry and the SELPHY would print the photo twice.
	return withTimeout(printJob(message), PRINT_JOB_TIMEOUT_MS, "Print-Job");
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
	// The debug file printer "prints" by writing the image to its folder.
	if (isDebugPrinterUri(uri)) {
		return writeDebugPrint(debugDirFromUri(uri), imageBuffer, params);
	}

	const versions = IPP_VERSIONS.includes(preferredVersion)
		? [preferredVersion, ...IPP_VERSIONS.filter((version) => version !== preferredVersion)]
		: IPP_VERSIONS;

	let lastError: unknown;

	for (const version of versions) {
		// (1) Wake ping + out-of-paper guard.
		try {
			const attributes = await getPrinterAttributes(uri, version);
			if (isOutOfPaper(attributes)) {
				// Retryable on purpose: the queue must hold this job and keep retrying
				// until the operator refills the media (see PrintQueue / no-loss rule).
				throw new OutOfPaperError();
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

	// Surface a classified error so the queue knows whether to keep retrying
	// (out-of-paper, unreachable, transient reject) or drop a permanently
	// malformed job. Default is retryable — see classifyPrintError.
	throw classifyPrintError(lastError ?? new Error("Print failed across all IPP versions"));
}
