import { z } from "zod";

/**
 * Paper sizes mirror photocall's `PaperSize` union (lib/layout/types.ts). The
 * bridge keeps its own copy so it stays a standalone, dependency-free service.
 */
export const paperSizeSchema = z.enum([
	"selphy_postcard",
	"4x6",
	"5x7",
	"2x6_strip",
	"6x8",
	"a4",
	"letter",
]);

export type PaperSize = z.infer<typeof paperSizeSchema>;

export const orientationSchema = z.enum(["portrait", "landscape"]);
export type Orientation = z.infer<typeof orientationSchema>;

/** A printer discovered over mDNS (and its last-known live state). */
export interface DiscoveredPrinter {
	/** Stable id `${host}:${port}/${rp}` used by API callers. */
	id: string;
	name: string;
	host: string;
	port: number;
	/** Full IPP(S) URI used to talk to the printer. */
	uri: string;
	/** Coarse printer state keyword (`idle` | `processing` | `stopped`). */
	state: string;
	/** Detailed state reasons (e.g. `media-empty`, `none`). */
	stateReasons: string[];
	/** Supply levels in percent, parallel to `markerNames`. */
	markerLevels: number[];
	markerNames: string[];
	/** IPP `media-supported` keywords advertised by the printer. */
	mediaSupported: string[];
	/** Supported copy counts (range or discrete values). */
	copiesSupported: number[];
	/** Human-readable make/model, when the printer reports it. */
	makeAndModel?: string;
	/** Whether the last attribute query reached the printer. */
	reachable: boolean;
	/** Epoch millis of the last successful (or attempted) refresh. */
	lastSeen: number;
}

/** Body accepted by `POST /api/jobs`. */
export const printJobRequestSchema = z.object({
	printerId: z.string().min(1),
	/** JPEG image, base64-encoded (no data: prefix). */
	imageBase64: z.string().min(1),
	paperSize: paperSizeSchema,
	borderless: z.boolean().default(true),
	copies: z.number().int().min(1).max(99).default(1),
	orientation: orientationSchema.default("portrait"),
	/** Optional IPP media-type override (defaults to `photographic`). */
	mediaType: z.string().optional(),
});

export type JobStatus = "pending" | "printing" | "done" | "failed";

/** A queued print job and its lifecycle metadata. */
export interface QueuedJob {
	id: string;
	printerId: string;
	status: JobStatus;
	/** How the job was settled, for diagnostics (e.g. media-col fallback used). */
	note?: string;
	error?: string;
	attempts: number;
	/** IPP job id returned by the printer on success. */
	ippJobId?: number;
	createdAt: number;
	updatedAt: number;
}

/** Print parameters resolved for a single IPP Print-Job. */
export interface PrintParams {
	paperSize: PaperSize;
	borderless: boolean;
	copies: number;
	orientation: Orientation;
	mediaType: string;
}

/** Outcome of a single IPP print attempt. */
export interface PrintResult {
	ippJobId?: number;
	/** Set when a reliability fallback (e.g. media→keyword) was used. */
	note?: string;
}
