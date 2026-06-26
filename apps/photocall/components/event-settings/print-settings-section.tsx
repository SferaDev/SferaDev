"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { listReportedPrinters, type ReportedPrinter } from "@/actions/print-jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { printImage } from "@/lib/canvas-utils";
import type { Orientation, PaperSize } from "@/lib/layout/types";
import { PAPER_SIZE_MM } from "@/lib/layout/types";
import { uploadAndEnqueuePrintJob } from "@/lib/print";
import { isPrinterOnline } from "@/lib/print/printer-status";
import type { EventPrintConfig, PrintMethod } from "@/lib/print/types";

/** How often the printer picker re-polls the cloud for reported printers (ms). */
const PRINTER_POLL_INTERVAL_MS = 5_000;

/** CSS `@page size` hint (mm) for the manual (AirPrint) test-print dialog. */
function pageSizeHint(paperSize: PaperSize): string {
	const { widthMm, heightMm } = PAPER_SIZE_MM[paperSize];
	return `${widthMm}mm ${heightMm}mm`;
}

/** Print fields the print section reads and writes. */
export interface PrintSettingsData {
	printMethod: PrintMethod;
	printPrinterId: string;
	printPaperSize: PaperSize;
	printMediaType: string;
	printBorderless: boolean;
	printCopies: number;
	printOrientation: Orientation;
	printAutoPrint: boolean;
}

interface PrintSettingsSectionProps {
	/**
	 * The event being configured. Drives the cloud-pull printer picker
	 * ({@link listReportedPrinters}) and the server-side test print
	 * ({@link uploadAndEnqueuePrintJob}). Null before the event has loaded.
	 */
	eventId: string | null;
	data: PrintSettingsData;
	/** Applies a partial patch to the parent form state. */
	onChange: (patch: Partial<PrintSettingsData>) => void;
	/** Brand color used to render the test-print swatch (falls back to default). */
	primaryColor: string;
	/**
	 * Persists a printer selection to `event.printPrinterId` immediately (the
	 * parent awaits its `updateEvent` and re-validates), without waiting for the
	 * page-level "Save changes" button. Used both when the operator picks a
	 * printer and when the sole reachable printer is auto-selected, so the choice
	 * is sticky and jobs always carry a `printerId`. Optional: when omitted the
	 * picker still updates the form (saved on the next page-level save) and
	 * auto-select is disabled.
	 */
	onPersistPrinter?: (printerId: string) => Promise<void>;
}

export function PrintSettingsSection({
	eventId,
	data,
	onChange,
	primaryColor,
	onPersistPrinter,
}: PrintSettingsSectionProps) {
	const t = useTranslations("dashboard.eventSettings");

	// Printers the on-site bridge has reported to the cloud. Polled automatically
	// while the bridge print method is active so the dropdown is populated without
	// the operator having to do anything.
	const [reportedPrinters, setReportedPrinters] = useState<ReportedPrinter[]>([]);
	// `false` = not polled yet (initial). Distinguishing this from "polled, found
	// none" is what lets us show a real empty/offline message instead of a
	// spinner that never resolves.
	const [bridgePolled, setBridgePolled] = useState(false);
	const [bridgeLoading, setBridgeLoading] = useState(false);
	const [testPrinting, setTestPrinting] = useState(false);
	// Set true once we auto-select the sole printer for THIS event load, so we
	// never repeatedly clobber an operator who deliberately picks "No printer".
	const autoSelectedRef = useRef(false);

	const printConfig: EventPrintConfig = {
		eventId: eventId ?? "",
		printMethod: data.printMethod,
		printPrinterId: data.printPrinterId || null,
		printPaperSize: data.printPaperSize,
		printMediaType: data.printMediaType || null,
		printBorderless: data.printBorderless,
		printCopies: data.printCopies,
		printOrientation: data.printOrientation,
		printAutoPrint: data.printAutoPrint,
	};

	const isBridge = data.printMethod === "bridge";

	/**
	 * Load the printers the on-site bridge has reported to the cloud and reflect
	 * the outcome in the picker. Never throws (failures are swallowed), so the
	 * loading state always clears: the picker can't get stuck on a spinner.
	 */
	const refreshPrinters = useCallback(async () => {
		if (!eventId) return;
		setBridgeLoading(true);
		try {
			setReportedPrinters(await listReportedPrinters(eventId));
		} catch {
			// Transient: keep the last-known list rather than flashing empty.
		} finally {
			setBridgeLoading(false);
			setBridgePolled(true);
		}
	}, [eventId]);

	// Auto-poll while the bridge print method is active, so the picker is
	// populated without the operator clicking anything, and keeps up if the
	// bridge comes online (or a printer is plugged in) after the page loads. The
	// poll stops when the method isn't `bridge`.
	const refreshRef = useRef(refreshPrinters);
	refreshRef.current = refreshPrinters;
	useEffect(() => {
		if (!isBridge) return;
		void refreshRef.current();
		const timer = setInterval(() => void refreshRef.current(), PRINTER_POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [isBridge]);

	const reachablePrinters = reportedPrinters.filter(isPrinterOnline);
	const savedPrinterIsReachable =
		!!data.printPrinterId && reachablePrinters.some((p) => p.printerId === data.printPrinterId);

	/**
	 * Auto-select the sole reachable printer so jobs always carry a `printerId`
	 * and "No printer selected" can't happen in the common one-printer setup.
	 *
	 * Fires only when: bridge mode is active, exactly one printer is reachable,
	 * and no still-reachable printer is already saved. It runs at most once per
	 * mount (autoSelectedRef) so it never clobbers an operator who then clears the
	 * selection back to "No printer". Persisted immediately when the parent wired
	 * `onPersistPrinter`, so the choice is sticky without a manual save.
	 */
	useEffect(() => {
		if (!isBridge || !onPersistPrinter || autoSelectedRef.current) return;
		if (savedPrinterIsReachable) return;
		if (reachablePrinters.length !== 1) return;
		const sole = reachablePrinters[0];
		if (!sole || sole.printerId === data.printPrinterId) return;
		autoSelectedRef.current = true;
		onChange({ printPrinterId: sole.printerId });
		void onPersistPrinter(sole.printerId);
	}, [
		isBridge,
		onPersistPrinter,
		onChange,
		savedPrinterIsReachable,
		reachablePrinters,
		data.printPrinterId,
	]);

	/**
	 * Persist an explicit operator pick straight to `event.printPrinterId` (await
	 * the parent's update) so the selection sticks even if the operator navigates
	 * away before pressing the page-level save. A bare form patch is kept as the
	 * fallback when no persist callback is wired.
	 */
	const handlePickPrinter = useCallback(
		(printerId: string) => {
			const next = printerId === "none" ? "" : printerId;
			// An explicit pick is the operator's decision — don't let auto-select
			// override it later this mount.
			autoSelectedRef.current = true;
			onChange({ printPrinterId: next });
			if (onPersistPrinter) void onPersistPrinter(next);
		},
		[onChange, onPersistPrinter],
	);

	const handleTestPrint = async () => {
		setTestPrinting(true);
		try {
			// A small solid-color JPEG so operators can validate the full path.
			const canvas = document.createElement("canvas");
			canvas.width = 600;
			canvas.height = 900;
			const context = canvas.getContext("2d");
			if (context) {
				context.fillStyle = primaryColor || DEFAULT_BRAND_COLOR;
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = "#ffffff";
				context.font = "bold 48px system-ui, sans-serif";
				context.textAlign = "center";
				context.fillText(t("print.testPrintLabel"), canvas.width / 2, canvas.height / 2);
			}
			const blob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, "image/jpeg", 0.9),
			);
			if (!blob) return;
			// The settings test proves the print path works before an event goes
			// live: `manual` opens the AirPrint dialog directly, while `bridge`
			// enqueues a server-side job the on-site bridge claims from the cloud
			// (the same upload→enqueue path guest prints use).
			if (data.printMethod === "manual") {
				const url = URL.createObjectURL(blob);
				try {
					await printImage(url, pageSizeHint(data.printPaperSize));
				} finally {
					setTimeout(() => URL.revokeObjectURL(url), 60_000);
				}
			} else if (data.printMethod === "bridge" && eventId) {
				await uploadAndEnqueuePrintJob(blob, printConfig);
			}
		} catch (error) {
			console.error("Test print failed:", error);
		} finally {
			setTestPrinting(false);
		}
	};

	const selectedPrinter = reportedPrinters.find((p) => p.printerId === data.printPrinterId);

	return (
		<div className="space-y-4">
			<div>
				<Label>{t("print.printMethod")}</Label>
				<p className="text-sm text-muted-foreground mb-2">{t("print.printMethodHelp")}</p>
				<Select
					value={data.printMethod}
					onValueChange={(value: PrintMethod) => onChange({ printMethod: value })}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">{t("print.methodNone")}</SelectItem>
						<SelectItem value="manual">{t("print.methodManual")}</SelectItem>
						<SelectItem value="bridge">{t("print.methodBridge")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{data.printMethod === "bridge" && (
				<div className="border-t pt-4 space-y-4">
					<div>
						<Label>{t("print.printer")}</Label>
						<Select value={data.printPrinterId || "none"} onValueChange={handlePickPrinter}>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder={t("print.selectPrinter")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">{t("print.noPrinterSelected")}</SelectItem>
								{/* Keep a stale saved printer selectable so the operator can still
								    see/keep it; it's flagged as "(saved)" and called out below. */}
								{data.printPrinterId &&
									!reportedPrinters.some((p) => p.printerId === data.printPrinterId) && (
										<SelectItem value={data.printPrinterId}>
											{t("print.printerSaved", { id: data.printPrinterId })}
										</SelectItem>
									)}
								{reportedPrinters.map((printer) => {
									const online = isPrinterOnline(printer);
									return (
										<SelectItem key={printer.id} value={printer.printerId} disabled={!online}>
											{online ? printer.name : `${printer.name} (${t("print.unreachable")})`}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>

						{/* Picker status: a real message instead of a perpetual spinner.
						    `bridgePolled` gates these so we don't flash "no printers" before
						    the first poll resolves. */}
						{bridgeLoading && reportedPrinters.length === 0 ? (
							<p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								{t("print.discoveringPrinters")}
							</p>
						) : bridgePolled && reachablePrinters.length === 0 ? (
							<p className="mt-2 text-sm text-amber-600">{t("print.noPrintersFound")}</p>
						) : null}

						{/* Stale selection: a printer is saved but the bridge isn't currently
						    reporting it as online — surface it rather than silently
						    dispatching to nothing. */}
						{data.printPrinterId && bridgePolled && !savedPrinterIsReachable ? (
							<p className="mt-2 text-sm text-amber-600">
								{t("print.printerStale", { id: data.printPrinterId })}
							</p>
						) : null}

						{selectedPrinter && (
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<Badge variant={isPrinterOnline(selectedPrinter) ? "default" : "destructive"}>
									{isPrinterOnline(selectedPrinter)
										? (selectedPrinter.state ?? t("print.unreachable"))
										: t("print.unreachable")}
								</Badge>
								{selectedPrinter.markerLevels.map((level, index) => (
									<Badge key={`${selectedPrinter.id}-marker-${index}`} variant="outline">
										{`${level}%`}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{data.printMethod !== "none" && (
				<div className="border-t pt-4 space-y-4">
					<div>
						<Label>{t("print.paperSize")}</Label>
						<Select
							value={data.printPaperSize}
							onValueChange={(value: PaperSize) => onChange({ printPaperSize: value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="selphy_postcard">{t("print.paperSelphy")}</SelectItem>
								<SelectItem value="4x6">{t("print.paper4x6")}</SelectItem>
								<SelectItem value="5x7">{t("print.paper5x7")}</SelectItem>
								<SelectItem value="2x6_strip">{t("print.paper2x6Strip")}</SelectItem>
								<SelectItem value="6x8">{t("print.paper6x8")}</SelectItem>
								<SelectItem value="a4">{t("print.paperA4")}</SelectItem>
								<SelectItem value="letter">{t("print.paperLetter")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>{t("print.mediaType")}</Label>
						<Select
							value={data.printMediaType}
							onValueChange={(value) => onChange({ printMediaType: value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="photo_glossy">{t("print.mediaGlossy")}</SelectItem>
								<SelectItem value="photo_matte">{t("print.mediaMatte")}</SelectItem>
								<SelectItem value="photo_satin">{t("print.mediaSatin")}</SelectItem>
								<SelectItem value="photographic">{t("print.mediaPhotographic")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<Label>{t("print.borderless")}</Label>
							<p className="text-sm text-muted-foreground">{t("print.borderlessHelp")}</p>
						</div>
						<Switch
							checked={data.printBorderless}
							onCheckedChange={(checked) => onChange({ printBorderless: checked })}
						/>
					</div>

					<div>
						<Label htmlFor="copies">{t("print.copies")}</Label>
						<Input
							id="copies"
							type="number"
							value={data.printCopies}
							onChange={(e) =>
								onChange({
									printCopies: Math.max(1, Math.min(99, Number.parseInt(e.target.value, 10) || 1)),
								})
							}
							className="mt-2"
							min={1}
							max={99}
						/>
						<p className="text-sm text-muted-foreground mt-2">{t("print.copiesTwoUpHint")}</p>
					</div>

					<div>
						<Label>{t("print.orientation")}</Label>
						<Select
							value={data.printOrientation}
							onValueChange={(value: Orientation) => onChange({ printOrientation: value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="portrait">{t("print.portrait")}</SelectItem>
								<SelectItem value="landscape">{t("print.landscape")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<Label>{t("print.autoPrint")}</Label>
							<p className="text-sm text-muted-foreground">{t("print.autoPrintHelp")}</p>
						</div>
						<Switch
							checked={data.printAutoPrint}
							onCheckedChange={(checked) => onChange({ printAutoPrint: checked })}
						/>
					</div>

					<Button type="button" variant="outline" onClick={handleTestPrint} disabled={testPrinting}>
						{testPrinting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
						{t("print.testPrint")}
					</Button>
				</div>
			)}
		</div>
	);
}
