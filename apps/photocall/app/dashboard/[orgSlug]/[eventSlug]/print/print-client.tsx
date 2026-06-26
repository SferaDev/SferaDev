"use client";

import {
	AlertTriangle,
	Ban,
	CheckCircle2,
	ChevronLeft,
	ImagePlus,
	Loader2,
	Printer,
	RefreshCw,
	Settings,
	Trash2,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import {
	cancelPrintJob,
	listPrintJobs,
	listReportedPrinters,
	type PrintJob,
	type ReportedPrinter,
} from "@/actions/print-jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { type Orientation, PAPER_SIZE_MM, type PaperSize } from "@/lib/layout/types";
import { uploadAndEnqueuePrintJob } from "@/lib/print";
import { getQueuedPrints, type QueuedPrintJob, removeQueuedPrint } from "@/lib/print/print-queue";
import { isOutOfPaper, isPrinterOnline } from "@/lib/print/printer-status";
import type { EventPrintConfig } from "@/lib/print/types";

/** How often the live print queue + reported-printer list is polled (ms). */
const POLL_INTERVAL_MS = 4_000;

const PAPER_SIZES = Object.keys(PAPER_SIZE_MM) as PaperSize[];

/** Narrow the DB's free-text paper size into a typed `PaperSize` (no casts). */
function toPaperSize(value: string | null): PaperSize {
	return PAPER_SIZES.find((size) => size === value) ?? "selphy_postcard";
}

/** Narrow the DB's free-text orientation into a typed `Orientation` (no casts). */
function toOrientation(value: string): Orientation {
	return value === "landscape" ? "landscape" : "portrait";
}

/**
 * Admin print-management page. Drives the CLOUD-PULL print model end to end: the
 * on-site bridge polls this server for jobs and heartbeats its printers up, and
 * this dashboard reads that reported state. It shows the printers the bridge has
 * reported (with paper/marker levels, online state and out-of-paper warnings),
 * the server-side print queue (with cancel), this device's offline outbox, and
 * controls to test-print and to add arbitrary pictures to the queue.
 *
 * It no longer talks to the LAN bridge directly (that legacy path was blocked by
 * mixed content on an HTTPS kiosk); everything goes through the cloud queue.
 */
export default function PrintManagement() {
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const t = useTranslations("dashboard.print");
	const ts = useTranslations("dashboard.eventSettings.print");

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);

	// Printers the on-site bridge has reported (heartbeated to the cloud). This is
	// the source of truth for printer presence — derived from heartbeat recency,
	// never a direct LAN ping.
	const [printers, setPrinters] = useState<ReportedPrinter[]>([]);
	// The SERVER-side print queue (printJobs rows). Source of truth, visible on
	// every device regardless of which kiosk enqueued a job.
	const [serverJobs, setServerJobs] = useState<PrintJob[]>([]);
	// Locally-queued prints parked in the offline outbox (IndexedDB) when the
	// enqueue couldn't reach the server. Per-device: it reflects only the jobs
	// queued on THIS browser/kiosk, not a server-side queue.
	const [offlineJobs, setOfflineJobs] = useState<QueuedPrintJob[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [busyPrinterId, setBusyPrinterId] = useState<string | null>(null);
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	// Operator-driven "add picture(s) to the queue": a hidden file input triggered
	// by a button, plus a per-batch copies count seeded from the event default.
	const pictureInputRef = useRef<HTMLInputElement>(null);
	const [pictureCopies, setPictureCopies] = useState(1);
	const [addingPictures, setAddingPictures] = useState(false);
	const [pictureMessage, setPictureMessage] = useState<string | null>(null);

	/** Load the offline print outbox so locally-queued jobs are never invisible. */
	const refreshOfflineJobs = useCallback(async () => {
		if (typeof indexedDB === "undefined") return;
		setOfflineJobs(await getQueuedPrints());
	}, []);

	// Seed the copies input from the event's configured default once it loads,
	// while still letting the operator override it for a given batch.
	useEffect(() => {
		if (event) setPictureCopies(event.printCopies);
	}, [event?.printCopies]);

	/** Refresh the reported printers, the server-side queue and the offline outbox. */
	const refresh = useCallback(async () => {
		await refreshOfflineJobs();
		if (!event) return;
		setRefreshing(true);
		try {
			const [reportedPrinters, jobs] = await Promise.all([
				listReportedPrinters(event.id).catch(() => null),
				listPrintJobs(event.id).catch(() => null),
			]);
			// Keep the last-known values on a transient failure rather than flashing
			// empty lists.
			if (reportedPrinters) setPrinters(reportedPrinters);
			if (jobs) setServerJobs(jobs);
		} finally {
			setRefreshing(false);
		}
	}, [event, refreshOfflineJobs]);

	// Poll on an interval once the event has loaded.
	const refreshRef = useRef(refresh);
	refreshRef.current = refresh;
	useEffect(() => {
		if (!event) return;
		void refreshRef.current();
		const timer = setInterval(() => void refreshRef.current(), POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [event]);

	/** Build a small solid-color test JPEG so operators can validate the path. */
	const buildTestImage = useCallback(async (): Promise<Blob | null> => {
		const canvas = document.createElement("canvas");
		canvas.width = 600;
		canvas.height = 900;
		const context = canvas.getContext("2d");
		if (context) {
			context.fillStyle = event?.primaryColor || DEFAULT_BRAND_COLOR;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "#ffffff";
			context.font = "bold 48px system-ui, sans-serif";
			context.textAlign = "center";
			context.fillText(ts("testPrintLabel"), canvas.width / 2, canvas.height / 2);
		}
		return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
	}, [event?.primaryColor, ts]);

	/**
	 * Test-print to a specific printer by enqueuing a server-side job (the same
	 * upload→enqueue path guest prints use). The on-site bridge claims it from the
	 * cloud and prints — no direct LAN call. The job then appears in the queue.
	 */
	const printTo = useCallback(
		async (printerId: string) => {
			if (!event) return;
			setBusyPrinterId(printerId);
			setActionMessage(null);
			try {
				const blob = await buildTestImage();
				if (!blob) {
					setActionMessage(t("testPrintFailed"));
					return;
				}
				const config: EventPrintConfig = {
					eventId: event.id,
					printMethod: "bridge",
					printPrinterId: printerId,
					printPaperSize: toPaperSize(event.printPaperSize),
					printMediaType: event.printMediaType,
					printBorderless: event.printBorderless,
					printCopies: event.printCopies,
					printOrientation: toOrientation(event.printOrientation),
					printAutoPrint: event.printAutoPrint,
				};
				try {
					await uploadAndEnqueuePrintJob(blob, config);
					setActionMessage(t("testPrintSent"));
				} catch {
					setActionMessage(t("testPrintFailed"));
				}
				await refresh();
			} finally {
				setBusyPrinterId(null);
			}
		},
		[event, buildTestImage, refresh, t],
	);

	/**
	 * Enqueue one or more operator-picked images straight to the print queue,
	 * reusing the kiosk's exact upload→enqueue path (presigned R2 PUT + server-side
	 * job, never image bytes through a Server Action). Each file is enqueued
	 * independently so one bad upload never aborts the rest; afterwards we refresh
	 * the live queue so the new jobs appear alongside guest prints.
	 */
	const handleAddPictures = useCallback(
		async (files: FileList | null) => {
			if (!event?.printPrinterId || !files || files.length === 0) return;
			setAddingPictures(true);
			setPictureMessage(null);
			const config: EventPrintConfig = {
				eventId: event.id,
				printMethod: "bridge",
				printPrinterId: event.printPrinterId,
				printPaperSize: toPaperSize(event.printPaperSize),
				printMediaType: event.printMediaType,
				printBorderless: event.printBorderless,
				printCopies: Math.max(1, pictureCopies),
				printOrientation: toOrientation(event.printOrientation),
				printAutoPrint: event.printAutoPrint,
			};
			let succeeded = 0;
			let failed = 0;
			for (const file of Array.from(files)) {
				try {
					await uploadAndEnqueuePrintJob(file, config);
					succeeded += 1;
				} catch {
					failed += 1;
				}
			}
			setPictureMessage(
				failed === 0
					? t("picturesQueued", { count: succeeded })
					: t("picturesQueuedPartial", { succeeded, failed }),
			);
			setAddingPictures(false);
			await refresh();
		},
		[event, pictureCopies, refresh, t],
	);

	if (event === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">{t("eventNotFound")}</h1>
					<Button asChild>
						<Link href={`/dashboard/${orgSlug}`}>
							<ChevronLeft className="h-4 w-4 mr-2" />
							{t("back")}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	// "Add picture(s)" needs a configured target printer the bridge currently
	// reports as online (heartbeated recently + reachable).
	const targetPrinterOnline = printers.some(
		(printer) => printer.printerId === event.printPrinterId && isPrinterOnline(printer),
	);
	const pictureHint = !event.printPrinterId
		? t("selectPrinterFirst")
		: !targetPrinterOnline
			? t("noPrinterConnected")
			: null;
	const canAddPictures = !!event.printPrinterId && targetPrinterOnline && !addingPictures;

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center gap-4">
					<Link
						href={`/dashboard/${orgSlug}/${eventSlug}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<ChevronLeft className="h-5 w-5" />
					</Link>
					<div className="flex-1">
						<h1 className="font-bold text-xl">{t("title")}</h1>
						<p className="text-sm text-muted-foreground">{t("subtitle")}</p>
					</div>
					<Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={refreshing}>
						{refreshing ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4 mr-2" />
						)}
						{t("refresh")}
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/dashboard/${orgSlug}/${eventSlug}/settings`}>
							<Settings className="h-4 w-4 mr-2" />
							{t("printSettings")}
						</Link>
					</Button>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
				{/* Printers reported by the on-site bridge */}
				<section className="space-y-3">
					<h2 className="font-medium">{t("printersTitle")}</h2>
					{printers.length === 0 ? (
						<div className="rounded-lg border p-4 text-sm text-muted-foreground">
							{t("noPrinters")}
						</div>
					) : (
						<div className="space-y-3">
							{printers.map((printer) => (
								<PrinterCard
									key={printer.id}
									printer={printer}
									busy={busyPrinterId === printer.printerId}
									onTestPrint={() => void printTo(printer.printerId)}
								/>
							))}
						</div>
					)}
					{actionMessage ? <p className="text-sm text-muted-foreground">{actionMessage}</p> : null}
				</section>

				{/* Add picture(s) to the queue: upload arbitrary images and enqueue them
				    for the configured printer via the same R2 upload→enqueue path the
				    kiosk uses. Sent as-is — the bridge + print-scaling fit them to paper. */}
				<section className="rounded-lg border p-4 space-y-3">
					<div>
						<h2 className="font-medium">{t("addPicturesTitle")}</h2>
						<p className="text-sm text-muted-foreground">{t("addPicturesHelp")}</p>
					</div>
					<div className="flex flex-wrap items-end gap-2">
						<div className="w-24">
							<Label htmlFor="picture-copies">{t("copiesLabel")}</Label>
							<Input
								id="picture-copies"
								type="number"
								min={1}
								value={pictureCopies}
								onChange={(e) => setPictureCopies(Math.max(1, Number(e.target.value) || 1))}
								disabled={addingPictures}
							/>
						</div>
						<Button onClick={() => pictureInputRef.current?.click()} disabled={!canAddPictures}>
							{addingPictures ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<ImagePlus className="h-4 w-4 mr-2" />
							)}
							{t("addPictures")}
						</Button>
						<input
							ref={pictureInputRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={(e) => {
								void handleAddPictures(e.target.files);
								// Reset so picking the same files again re-triggers onChange.
								e.target.value = "";
							}}
						/>
					</div>
					{pictureHint ? <p className="text-sm text-muted-foreground">{pictureHint}</p> : null}
					{pictureMessage ? (
						<p className="text-sm text-muted-foreground">{pictureMessage}</p>
					) : null}
				</section>

				{/* Print queue (source of truth): the SERVER-side queue, visible on every
				    device. Locally-queued offline jobs (this device's IndexedDB outbox,
				    not yet enqueued) are shown ABOVE it. The empty state shows only when
				    both are empty, so a parked job is never mistaken for a lost one. */}
				<section className="space-y-3">
					<h2 className="font-medium">{t("queueTitle")}</h2>
					{serverJobs.length === 0 && offlineJobs.length === 0 ? (
						<div className="rounded-lg border p-4 text-sm text-muted-foreground">
							{t("queueEmpty")}
						</div>
					) : (
						<div className="divide-y rounded-lg border">
							{offlineJobs.map((job) => (
								<OfflineJobRow key={job.id} job={job} onRemoved={() => void refreshOfflineJobs()} />
							))}
							{serverJobs.map((job) => (
								<ServerJobRow key={job.id} job={job} onCanceled={() => void refresh()} />
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

function PrinterCard({
	printer,
	busy,
	onTestPrint,
}: {
	printer: ReportedPrinter;
	busy: boolean;
	onTestPrint: () => void;
}) {
	const t = useTranslations("dashboard.print");
	const online = isPrinterOnline(printer);
	const outOfPaper = isOutOfPaper(printer);

	return (
		<div className="rounded-lg border p-4 space-y-3">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 min-w-0">
					<Printer className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
					<div className="min-w-0">
						<div className="font-medium truncate">{printer.name}</div>
						<div className="text-sm text-muted-foreground truncate">
							{printer.makeAndModel ?? printer.printerId}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{online ? (
						<Badge variant="secondary">{printer.state || t("stateUnknown")}</Badge>
					) : (
						<Badge variant="destructive">{t("unreachable")}</Badge>
					)}
				</div>
			</div>

			{outOfPaper ? (
				<div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					<AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
					{t("outOfPaper")}
				</div>
			) : null}

			{printer.markerLevels.length > 0 ? (
				<div className="space-y-1">
					{printer.markerLevels.map((level, index) => (
						<div key={`${printer.id}-marker-${index}`} className="text-sm">
							<div className="flex justify-between text-muted-foreground">
								<span>{t("markerDefault")}</span>
								<span>{level}%</span>
							</div>
							<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className={`h-full rounded-full ${level <= 15 ? "bg-destructive" : "bg-primary"}`}
									style={{ width: `${Math.max(0, Math.min(100, level))}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			) : null}

			<div className="flex items-center gap-2">
				<Button size="sm" variant="outline" onClick={onTestPrint} disabled={busy || !online}>
					{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
					{t("testPrint")}
				</Button>
			</div>
		</div>
	);
}

/** Map a server-side printJobs status to a queue status icon. */
function ServerJobStatusIcon({ status }: { status: PrintJob["status"] }) {
	switch (status) {
		case "claimed":
		case "printing":
			return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />;
		case "done":
			return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />;
		case "failed":
			return <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />;
		case "canceled":
			return <Ban className="h-5 w-5 text-muted-foreground" aria-hidden="true" />;
		default:
			return <div className="h-5 w-5 rounded-full border-2 border-muted" aria-hidden="true" />;
	}
}

/**
 * Non-terminal statuses a host may still cancel. Kept in sync with the server's
 * `CANCELABLE_PRINT_JOB_STATUSES` (not imported here so the Drizzle schema never
 * gets pulled into the client bundle).
 */
function isCancelable(status: PrintJob["status"]): boolean {
	return status === "queued" || status === "claimed" || status === "printing";
}

/**
 * A row in the SERVER-side print queue (a printJobs row). Source of truth, shown
 * on every device. Surfaces the target printer, the lifecycle status
 * (queued/claimed/printing/done/failed/canceled) and the last error when it failed.
 *
 * Non-terminal jobs (queued/claimed/printing) get a Cancel control: canceling a
 * queued job prevents it from ever printing; for a claimed/printing job it's
 * best-effort — it stops further attempts and the bridge untracks it on its next
 * heartbeat — but a page already sent to the printer can't be recalled.
 */
function ServerJobRow({ job, onCanceled }: { job: PrintJob; onCanceled: () => void }) {
	const t = useTranslations("dashboard.print");
	const [canceling, setCanceling] = useState(false);
	// printJobs distinguishes "queued" (not yet claimed) from "claimed"; the
	// existing labels only cover pending/printing/done/failed/canceled, so fold both
	// pre-print states onto the "pending" label and map "claimed" onto "printing".
	const labelKey =
		job.status === "queued" ? "pending" : job.status === "claimed" ? "printing" : job.status;

	const handleCancel = useCallback(async () => {
		setCanceling(true);
		try {
			await cancelPrintJob(job.id);
			onCanceled();
		} finally {
			setCanceling(false);
		}
	}, [job.id, onCanceled]);

	return (
		<div className="flex items-center gap-3 p-3">
			<ServerJobStatusIcon status={job.status} />
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm truncate">{job.printerId}</div>
				<div className="text-xs text-muted-foreground truncate">
					{job.lastError ?? t(`jobStatus.${labelKey}`)}
					{job.attempts > 1 ? ` · ${t("jobAttempts", { count: job.attempts })}` : ""}
				</div>
			</div>
			<Badge
				variant={
					job.status === "failed"
						? "destructive"
						: job.status === "canceled"
							? "outline"
							: "secondary"
				}
			>
				{t(`jobStatus.${labelKey}`)}
			</Badge>
			{isCancelable(job.status) ? (
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground hover:text-destructive shrink-0"
					onClick={() => void handleCancel()}
					disabled={canceling}
					aria-label={t("cancelJob")}
					title={t("cancelJob")}
				>
					{canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
				</Button>
			) : null}
		</div>
	);
}

/**
 * Create a temporary object URL for a blob and revoke it on unmount or when the
 * blob changes, so previewing many queued strips never leaks object URLs.
 */
function useObjectUrl(blob: Blob): string {
	const [url, setUrl] = useState(() => URL.createObjectURL(blob));
	useEffect(() => {
		const objectUrl = URL.createObjectURL(blob);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [blob]);
	return url;
}

/**
 * A print job parked in this device's offline outbox (IndexedDB), shown in the
 * same queue as the server-side jobs so a host can see it's waiting, not lost.
 * Always renders the "pending" state — these jobs have not been enqueued yet —
 * and surfaces `lastError` as the reason it's waiting (falling back to a generic
 * "waiting on this device" note).
 *
 * Shows a thumbnail of the queued strip so the operator can tell the jobs apart,
 * and a destructive "remove" control to clear a stuck job from this device's
 * outbox (calling `onRemoved` to refresh the list afterwards).
 */
function OfflineJobRow({ job, onRemoved }: { job: QueuedPrintJob; onRemoved: () => void }) {
	const t = useTranslations("dashboard.print");
	const previewUrl = useObjectUrl(job.blob);
	const [removing, setRemoving] = useState(false);

	const handleRemove = useCallback(async () => {
		setRemoving(true);
		try {
			await removeQueuedPrint(job.id);
			onRemoved();
		} finally {
			setRemoving(false);
		}
	}, [job.id, onRemoved]);

	return (
		<div className="flex items-center gap-3 p-3">
			<div className="h-5 w-5 rounded-full border-2 border-muted" aria-hidden="true" />
			<img src={previewUrl} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm truncate">{t("jobStatus.pending")}</div>
				<div className="text-xs text-muted-foreground truncate">
					{job.lastError ?? t("queuedOfflineNote")}
					{job.attempts > 1 ? ` · ${t("jobAttempts", { count: job.attempts })}` : ""}
				</div>
			</div>
			<Badge variant="secondary">{t("jobStatus.pending")}</Badge>
			<Button
				variant="ghost"
				size="icon"
				className="text-muted-foreground hover:text-destructive shrink-0"
				onClick={() => void handleRemove()}
				disabled={removing}
				aria-label={t("removeJob")}
				title={t("removeJob")}
			>
				{removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
			</Button>
		</div>
	);
}
