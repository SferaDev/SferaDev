"use client";

/**
 * Browser-side client for the print bridge REST API (apps/print-bridge).
 *
 * Every call is defensive: the bridge runs on a flaky LAN and may be asleep or
 * restarting, so requests time out and **never throw** on network errors —
 * they resolve to a typed failure the caller can branch on.
 */

import type { EventPrintConfig } from "@/lib/print/types";

/** A printer as reported by `GET /api/printers`. */
export interface BridgePrinter {
	id: string;
	name: string;
	host: string;
	port: number;
	uri: string;
	state: string;
	stateReasons: string[];
	markerLevels: number[];
	markerNames: string[];
	mediaSupported: string[];
	copiesSupported: number[];
	makeAndModel?: string;
	reachable: boolean;
	lastSeen: number;
}

export type BridgeJobStatus = "pending" | "printing" | "done" | "failed";

/** A job as reported by `GET /api/jobs/:id`. */
export interface BridgeJob {
	id: string;
	printerId: string;
	status: BridgeJobStatus;
	note?: string;
	error?: string;
	attempts: number;
	ippJobId?: number;
}

export type SubmitResult = { ok: true; jobId: string } | { ok: false; error: string };
export type PrintersResult = { ok: true; printers: BridgePrinter[] } | { ok: false; error: string };
export type PrinterResult = { ok: true; printer: BridgePrinter } | { ok: false; error: string };
export type JobResult = { ok: true; job: BridgeJob } | { ok: false; error: string };
export type JobsResult = { ok: true; jobs: BridgeJob[] } | { ok: false; error: string };

function trimBase(url: string): string {
	return url.replace(/\/+$/, "");
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
 * Encode a Blob to a base64 string in fixed-size chunks. A naive
 * `String.fromCharCode(...bytes)` blows the call-stack argument limit on large
 * images, so we accumulate in 8KB windows.
 */
async function blobToBase64(blob: Blob): Promise<string> {
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const CHUNK = 0x8000;
	let binary = "";
	for (let i = 0; i < bytes.length; i += CHUNK) {
		const chunk = bytes.subarray(i, i + CHUNK);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary);
}

/** Liveness check: `GET /health` with a short timeout. */
export async function pingBridge(url: string): Promise<boolean> {
	const response = await fetchWithTimeout(`${trimBase(url)}/health`, { method: "GET" }, 3_000);
	return response?.ok ?? false;
}

/** List discovered printers (`GET /api/printers`). */
export async function listBridgePrinters(url: string): Promise<PrintersResult> {
	const response = await fetchWithTimeout(
		`${trimBase(url)}/api/printers`,
		{ method: "GET" },
		5_000,
	);
	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge error (${response.status})` };
	const printers: BridgePrinter[] = await response.json();
	return { ok: true, printers };
}

/** Submit a print job (`POST /api/jobs`). */
export async function submitPrintJob(
	url: string,
	blob: Blob,
	config: EventPrintConfig,
): Promise<SubmitResult> {
	if (!config.printPrinterId) return { ok: false, error: "No printer selected" };
	if (!config.printPaperSize) return { ok: false, error: "No paper size configured" };

	const imageBase64 = await blobToBase64(blob);
	const response = await fetchWithTimeout(
		`${trimBase(url)}/api/jobs`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				printerId: config.printPrinterId,
				imageBase64,
				paperSize: config.printPaperSize,
				borderless: config.printBorderless,
				copies: config.printCopies,
				orientation: config.printOrientation,
				mediaType: config.printMediaType ?? undefined,
			}),
		},
		10_000,
	);

	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge rejected the job (${response.status})` };
	const body: { jobId: string } = await response.json();
	return { ok: true, jobId: body.jobId };
}

/** Poll a job's status (`GET /api/jobs/:id`). */
export async function getJobStatus(url: string, jobId: string): Promise<JobResult> {
	const response = await fetchWithTimeout(
		`${trimBase(url)}/api/jobs/${encodeURIComponent(jobId)}`,
		{ method: "GET" },
		5_000,
	);
	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge error (${response.status})` };
	const job: BridgeJob = await response.json();
	return { ok: true, job };
}

/** List the bridge's recent print queue (`GET /api/jobs`, most recent first). */
export async function listBridgeJobs(url: string): Promise<JobsResult> {
	const response = await fetchWithTimeout(`${trimBase(url)}/api/jobs`, { method: "GET" }, 5_000);
	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge error (${response.status})` };
	const jobs: BridgeJob[] = await response.json();
	return { ok: true, jobs };
}

/** Live status of a single printer (`GET /api/printers/:id/status`). */
export async function getPrinterStatus(url: string, printerId: string): Promise<PrinterResult> {
	const response = await fetchWithTimeout(
		`${trimBase(url)}/api/printers/${encodeURIComponent(printerId)}/status`,
		{ method: "GET" },
		8_000,
	);
	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge error (${response.status})` };
	const printer: BridgePrinter = await response.json();
	return { ok: true, printer };
}

/**
 * Add a printer by IPP(S) URI or bare host/IP (`POST /api/printers`). This is
 * the manual fallback for networks where the bridge's mDNS discovery does not
 * surface the printer.
 */
export async function addBridgePrinter(
	url: string,
	uri: string,
	name?: string,
): Promise<PrinterResult> {
	const response = await fetchWithTimeout(
		`${trimBase(url)}/api/printers`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ uri, ...(name ? { name } : {}) }),
		},
		12_000,
	);
	if (!response) return { ok: false, error: "Could not reach the print bridge" };
	if (!response.ok) return { ok: false, error: `Bridge rejected the printer (${response.status})` };
	const printer: BridgePrinter = await response.json();
	return { ok: true, printer };
}
