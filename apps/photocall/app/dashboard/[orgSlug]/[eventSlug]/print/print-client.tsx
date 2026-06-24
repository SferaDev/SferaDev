"use client";

import {
	AlertTriangle,
	CheckCircle2,
	ChevronLeft,
	Loader2,
	Plus,
	Printer,
	RefreshCw,
	Settings,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { type Orientation, PAPER_SIZE_MM, type PaperSize } from "@/lib/layout/types";
import {
	addBridgePrinter,
	type BridgeJob,
	type BridgePrinter,
	listBridgeJobs,
	listBridgePrinters,
	pingBridge,
	submitPrintJob,
} from "@/lib/print/bridge-client";
import type { EventPrintConfig } from "@/lib/print/types";

/** How often the live print queue + printer list is polled (ms). */
const POLL_INTERVAL_MS = 4_000;

/** True when a printer's state reasons indicate it ran out of paper. */
function isOutOfPaper(printer: BridgePrinter): boolean {
	const reasons = printer.stateReasons.join(" ").toLowerCase();
	return reasons.includes("media-empty") || reasons.includes("media-needed");
}

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
 * Admin print-management page. Drives the local print bridge over the LAN:
 * shows the bridge connection, discovered + manually-added printers (with
 * paper/marker levels and out-of-paper warnings), a live print queue, and
 * controls to test-print, reprint, and add a printer by IP.
 *
 * It complements the Print settings tab (which configures the bridge URL and
 * default printer) — this page is the live operational dashboard.
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

	const bridgeUrl = event?.printBridgeUrl ?? null;

	const [online, setOnline] = useState<boolean | null>(null);
	const [printers, setPrinters] = useState<BridgePrinter[]>([]);
	const [jobs, setJobs] = useState<BridgeJob[]>([]);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const [newPrinterUri, setNewPrinterUri] = useState("");
	const [addingPrinter, setAddingPrinter] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);

	const [busyPrinterId, setBusyPrinterId] = useState<string | null>(null);
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	/** Poll the bridge for connection, printers and the job queue. */
	const refresh = useCallback(async () => {
		if (!bridgeUrl) {
			setOnline(null);
			return;
		}
		setRefreshing(true);
		try {
			const reachable = await pingBridge(bridgeUrl);
			setOnline(reachable);
			if (!reachable) {
				setLoadError(t("bridgeUnreachable"));
				return;
			}
			const [printersResult, jobsResult] = await Promise.all([
				listBridgePrinters(bridgeUrl),
				listBridgeJobs(bridgeUrl),
			]);
			if (printersResult.ok) {
				setPrinters(printersResult.printers);
				setLoadError(null);
			} else {
				setLoadError(printersResult.error);
			}
			if (jobsResult.ok) setJobs(jobsResult.jobs);
		} finally {
			setRefreshing(false);
		}
	}, [bridgeUrl, t]);

	// Poll on an interval while the bridge URL is configured.
	const refreshRef = useRef(refresh);
	refreshRef.current = refresh;
	useEffect(() => {
		if (!bridgeUrl) return;
		void refreshRef.current();
		const timer = setInterval(() => void refreshRef.current(), POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [bridgeUrl]);

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
	 * Send a test print to a specific printer. Reused for both "test print" and
	 * "reprint": the bridge does not retain the original image, so a reprint
	 * re-issues a fresh test page to the same printer.
	 */
	const printTo = useCallback(
		async (printerId: string, successKey: "testPrintSent" | "reprintSent") => {
			if (!event || !bridgeUrl) return;
			setBusyPrinterId(printerId);
			setActionMessage(null);
			try {
				const blob = await buildTestImage();
				if (!blob) {
					setActionMessage(t("testPrintFailed"));
					return;
				}
				const config: EventPrintConfig = {
					printMethod: "bridge",
					printBridgeUrl: bridgeUrl,
					printPrinterId: printerId,
					printPaperSize: toPaperSize(event.printPaperSize),
					printMediaType: event.printMediaType,
					printBorderless: event.printBorderless,
					printCopies: event.printCopies,
					printOrientation: toOrientation(event.printOrientation),
					printAutoPrint: event.printAutoPrint,
				};
				const result = await submitPrintJob(bridgeUrl, blob, config);
				setActionMessage(result.ok ? t(successKey) : result.error);
				await refresh();
			} finally {
				setBusyPrinterId(null);
			}
		},
		[event, bridgeUrl, buildTestImage, refresh, t],
	);

	const handleAddPrinter = useCallback(async () => {
		if (!bridgeUrl || newPrinterUri.trim().length === 0) return;
		setAddingPrinter(true);
		setAddError(null);
		try {
			const result = await addBridgePrinter(bridgeUrl, newPrinterUri.trim());
			if (result.ok) {
				setNewPrinterUri("");
				await refresh();
			} else {
				setAddError(result.error);
			}
		} finally {
			setAddingPrinter(false);
		}
	}, [bridgeUrl, newPrinterUri, refresh]);

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
					<Button variant="outline" asChild>
						<Link href={`/dashboard/${orgSlug}/${eventSlug}/settings`}>
							<Settings className="h-4 w-4 mr-2" />
							{t("printSettings")}
						</Link>
					</Button>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
				{/* Bridge connection */}
				<section className="rounded-lg border p-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							{online === null ? (
								<AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
							) : online ? (
								<CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
							) : (
								<XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
							)}
							<div>
								<div className="font-medium">{t("bridgeConnection")}</div>
								<div className="text-sm text-muted-foreground">
									{!bridgeUrl
										? t("bridgeNoUrl")
										: online === null
											? t("bridgeChecking")
											: online
												? t("bridgeOnline", { url: bridgeUrl })
												: t("bridgeUnreachable")}
								</div>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => void refresh()}
							disabled={!bridgeUrl || refreshing}
						>
							{refreshing ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4 mr-2" />
							)}
							{t("refresh")}
						</Button>
					</div>
					{!bridgeUrl ? (
						<div className="mt-3 text-sm text-muted-foreground">
							{t("configureInSettings")}{" "}
							<Link
								href={`/dashboard/${orgSlug}/${eventSlug}/settings`}
								className="underline hover:text-foreground"
							>
								{t("printSettings")}
							</Link>
						</div>
					) : null}
				</section>

				{bridgeUrl ? (
					<>
						{/* Add printer by IP (manual fallback) */}
						<section className="rounded-lg border p-4 space-y-3">
							<div>
								<h2 className="font-medium">{t("addPrinterTitle")}</h2>
								<p className="text-sm text-muted-foreground">{t("addPrinterHelp")}</p>
							</div>
							<div className="flex items-start gap-2">
								<div className="flex-1">
									<Label htmlFor="printer-uri" className="sr-only">
										{t("addPrinterLabel")}
									</Label>
									<Input
										id="printer-uri"
										value={newPrinterUri}
										onChange={(e) => setNewPrinterUri(e.target.value)}
										placeholder={t("addPrinterPlaceholder")}
										disabled={addingPrinter || online === false}
									/>
								</div>
								<Button
									onClick={() => void handleAddPrinter()}
									disabled={addingPrinter || online === false || newPrinterUri.trim().length === 0}
								>
									{addingPrinter ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Plus className="h-4 w-4 mr-2" />
									)}
									{t("addPrinter")}
								</Button>
							</div>
							{addError ? <p className="text-sm text-destructive">{addError}</p> : null}
						</section>

						{/* Printers */}
						<section className="space-y-3">
							<h2 className="font-medium">{t("printersTitle")}</h2>
							{loadError ? (
								<div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
									{loadError}
								</div>
							) : printers.length === 0 ? (
								<div className="rounded-lg border p-4 text-sm text-muted-foreground">
									{t("noPrinters")}
								</div>
							) : (
								<div className="space-y-3">
									{printers.map((printer) => (
										<PrinterCard
											key={printer.id}
											printer={printer}
											busy={busyPrinterId === printer.id}
											disabled={online === false}
											onTestPrint={() => void printTo(printer.id, "testPrintSent")}
											onReprint={() => void printTo(printer.id, "reprintSent")}
										/>
									))}
								</div>
							)}
							{actionMessage ? (
								<p className="text-sm text-muted-foreground">{actionMessage}</p>
							) : null}
						</section>

						{/* Live print queue */}
						<section className="space-y-3">
							<h2 className="font-medium">{t("queueTitle")}</h2>
							{jobs.length === 0 ? (
								<div className="rounded-lg border p-4 text-sm text-muted-foreground">
									{t("queueEmpty")}
								</div>
							) : (
								<div className="divide-y rounded-lg border">
									{jobs.map((job) => (
										<JobRow key={job.id} job={job} />
									))}
								</div>
							)}
						</section>
					</>
				) : null}
			</main>
		</div>
	);
}

function PrinterCard({
	printer,
	busy,
	disabled,
	onTestPrint,
	onReprint,
}: {
	printer: BridgePrinter;
	busy: boolean;
	disabled: boolean;
	onTestPrint: () => void;
	onReprint: () => void;
}) {
	const t = useTranslations("dashboard.print");
	const outOfPaper = isOutOfPaper(printer);

	return (
		<div className="rounded-lg border p-4 space-y-3">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 min-w-0">
					<Printer className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
					<div className="min-w-0">
						<div className="font-medium truncate">{printer.name}</div>
						<div className="text-sm text-muted-foreground truncate">
							{printer.makeAndModel ?? printer.uri}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{printer.reachable ? (
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
					{printer.markerLevels.map((level, index) => {
						const name = printer.markerNames[index] ?? t("markerDefault");
						return (
							<div key={`${printer.id}-marker-${index}`} className="text-sm">
								<div className="flex justify-between text-muted-foreground">
									<span>{name}</span>
									<span>{level}%</span>
								</div>
								<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
									<div
										className={`h-full rounded-full ${level <= 15 ? "bg-destructive" : "bg-primary"}`}
										style={{ width: `${Math.max(0, Math.min(100, level))}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			) : null}

			<div className="flex items-center gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={onTestPrint}
					disabled={busy || disabled || !printer.reachable}
				>
					{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
					{t("testPrint")}
				</Button>
				<Button
					size="sm"
					variant="ghost"
					onClick={onReprint}
					disabled={busy || disabled || !printer.reachable}
				>
					{t("reprint")}
				</Button>
			</div>
		</div>
	);
}

function JobRow({ job }: { job: BridgeJob }) {
	const t = useTranslations("dashboard.print");
	return (
		<div className="flex items-center gap-3 p-3">
			<JobStatusIcon status={job.status} />
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm truncate">{job.printerId}</div>
				<div className="text-xs text-muted-foreground truncate">
					{job.error ?? job.note ?? t(`jobStatus.${job.status}`)}
					{job.attempts > 1 ? ` · ${t("jobAttempts", { count: job.attempts })}` : ""}
				</div>
			</div>
			<Badge variant={job.status === "failed" ? "destructive" : "secondary"}>
				{t(`jobStatus.${job.status}`)}
			</Badge>
		</div>
	);
}

function JobStatusIcon({ status }: { status: BridgeJob["status"] }) {
	switch (status) {
		case "printing":
			return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />;
		case "done":
			return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />;
		case "failed":
			return <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />;
		default:
			return <div className="h-5 w-5 rounded-full border-2 border-muted" aria-hidden="true" />;
	}
}
