"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
	type BridgePrinter,
	DEFAULT_BRIDGE_URL,
	listBridgePrinters,
	resolveBridgeUrl,
	submitPrintJob,
} from "@/lib/print/bridge-client";
import type { EventPrintConfig, PrintMethod } from "@/lib/print/types";

/** How often the printer picker re-polls the bridge for reachable printers (ms). */
const PRINTER_POLL_INTERVAL_MS = 5_000;

/** CSS `@page size` hint (mm) for the manual (AirPrint) test-print dialog. */
function pageSizeHint(paperSize: PaperSize): string {
	const { widthMm, heightMm } = PAPER_SIZE_MM[paperSize];
	return `${widthMm}mm ${heightMm}mm`;
}

/** Print fields the print section reads and writes. */
export interface PrintSettingsData {
	printMethod: PrintMethod;
	printBridgeUrl: string;
	printPrinterId: string;
	printPaperSize: PaperSize;
	printMediaType: string;
	printBorderless: boolean;
	printCopies: number;
	printOrientation: Orientation;
	printAutoPrint: boolean;
}

interface PrintSettingsSectionProps {
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
	data,
	onChange,
	primaryColor,
	onPersistPrinter,
}: PrintSettingsSectionProps) {
	const t = useTranslations("dashboard.eventSettings");

	// Reachable-printer discovery for the picker. Polled automatically while the
	// bridge print method is active so the dropdown is populated without the
	// operator having to remember to click "Test connection".
	const [bridgePrinters, setBridgePrinters] = useState<BridgePrinter[]>([]);
	// `null` = not polled yet (initial). Distinguishing this from "polled, found
	// none" is what lets us show a real empty/offline message instead of a
	// spinner that never resolves.
	const [bridgePolled, setBridgePolled] = useState(false);
	const [bridgeLoading, setBridgeLoading] = useState(false);
	const [bridgeError, setBridgeError] = useState<string | null>(null);
	const [testPrinting, setTestPrinting] = useState(false);
	// Set true once we auto-select the sole printer for THIS event load, so we
	// never repeatedly clobber an operator who deliberately picks "No printer".
	const autoSelectedRef = useRef(false);

	const printConfig: EventPrintConfig = {
		// The settings test-print never enqueues a server-side job (it validates the
		// configured LAN bridge / AirPrint dialog directly), so it has no eventId.
		eventId: "",
		printMethod: data.printMethod,
		printBridgeUrl: data.printBridgeUrl || null,
		printPrinterId: data.printPrinterId || null,
		printPaperSize: data.printPaperSize,
		printMediaType: data.printMediaType || null,
		printBorderless: data.printBorderless,
		printCopies: data.printCopies,
		printOrientation: data.printOrientation,
		printAutoPrint: data.printAutoPrint,
	};

	const isBridge = data.printMethod === "bridge";
	const bridgeUrl = data.printBridgeUrl;

	/**
	 * Poll the bridge for printers and reflect the outcome in the picker. A blank
	 * URL is valid — it means "use the mDNS default the bridge advertises" — so we
	 * always resolve it before calling out. Never throws (listBridgePrinters
	 * resolves to a typed failure), so the loading state always clears: the picker
	 * can't get stuck on a spinner when the bridge is offline.
	 */
	const refreshPrinters = useCallback(async () => {
		setBridgeLoading(true);
		setBridgeError(null);
		try {
			const result = await listBridgePrinters(resolveBridgeUrl(bridgeUrl));
			if (result.ok) {
				setBridgePrinters(result.printers);
				if (result.printers.length === 0) {
					setBridgeError(t("print.bridgeReachableNoPrinters"));
				}
			} else {
				setBridgePrinters([]);
				setBridgeError(result.error);
			}
		} finally {
			setBridgeLoading(false);
			setBridgePolled(true);
		}
	}, [bridgeUrl, t]);

	// Auto-poll the bridge while the bridge print method is active, so the picker
	// is populated without the operator clicking anything, and keeps up if the
	// bridge comes online (or a printer is plugged in) after the page loads. The
	// poll stops when the method isn't `bridge`. Re-arms when the URL changes.
	const refreshRef = useRef(refreshPrinters);
	refreshRef.current = refreshPrinters;
	useEffect(() => {
		if (!isBridge) return;
		void refreshRef.current();
		const timer = setInterval(() => void refreshRef.current(), PRINTER_POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [isBridge, bridgeUrl]);

	const reachablePrinters = bridgePrinters.filter((printer) => printer.reachable);
	const savedPrinterIsReachable =
		!!data.printPrinterId && reachablePrinters.some((p) => p.id === data.printPrinterId);

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
		if (!sole || sole.id === data.printPrinterId) return;
		autoSelectedRef.current = true;
		onChange({ printPrinterId: sole.id });
		void onPersistPrinter(sole.id);
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
			// The settings test validates the LAN bridge / AirPrint path directly,
			// NOT the server-side print queue: it proves the configured bridge URL +
			// printer (or the AirPrint dialog) work before an event goes live.
			if (data.printMethod === "manual") {
				const url = URL.createObjectURL(blob);
				try {
					await printImage(url, pageSizeHint(data.printPaperSize));
				} finally {
					setTimeout(() => URL.revokeObjectURL(url), 60_000);
				}
			} else if (data.printMethod === "bridge") {
				await submitPrintJob(resolveBridgeUrl(data.printBridgeUrl), blob, printConfig);
			}
		} catch (error) {
			console.error("Test print failed:", error);
		} finally {
			setTestPrinting(false);
		}
	};

	const selectedPrinter = bridgePrinters.find((p) => p.id === data.printPrinterId);

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
						<Label htmlFor="bridgeUrl">{t("print.printBridgeUrl")}</Label>
						<p className="text-sm text-muted-foreground mb-2">{t("print.printBridgeUrlHelp")}</p>
						<div className="flex gap-2">
							<Input
								id="bridgeUrl"
								value={data.printBridgeUrl}
								onChange={(e) => onChange({ printBridgeUrl: e.target.value })}
								placeholder="http://raspberrypi.local:3200"
								className="flex-1"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => void refreshPrinters()}
								disabled={bridgeLoading}
							>
								{bridgeLoading ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4 mr-2" />
								)}
								{t("print.testConnection")}
							</Button>
						</div>
						{!data.printBridgeUrl && (
							<p className="text-sm text-muted-foreground mt-2">
								{t("print.bridgeUrlBlankHint", { url: DEFAULT_BRIDGE_URL })}
							</p>
						)}
						{bridgeError && <p className="text-sm text-amber-600 mt-2">{bridgeError}</p>}
					</div>

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
									!bridgePrinters.some((p) => p.id === data.printPrinterId) && (
										<SelectItem value={data.printPrinterId}>
											{t("print.printerSaved", { id: data.printPrinterId })}
										</SelectItem>
									)}
								{bridgePrinters.map((printer) => (
									<SelectItem key={printer.id} value={printer.id} disabled={!printer.reachable}>
										{printer.reachable
											? printer.name
											: `${printer.name} (${t("print.unreachable")})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Picker status: a real message instead of a perpetual spinner.
						    `bridgePolled` gates these so we don't flash "no printers" before
						    the first poll resolves. */}
						{bridgeLoading && bridgePrinters.length === 0 ? (
							<p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								{t("print.discoveringPrinters")}
							</p>
						) : bridgePolled && reachablePrinters.length === 0 && !bridgeError ? (
							<p className="mt-2 text-sm text-amber-600">{t("print.noPrintersFound")}</p>
						) : null}

						{/* Stale selection: a printer is saved but no longer reachable on the
						    bridge — surface it rather than silently dispatching to nothing. */}
						{data.printPrinterId && bridgePolled && !savedPrinterIsReachable ? (
							<p className="mt-2 text-sm text-amber-600">
								{t("print.printerStale", { id: data.printPrinterId })}
							</p>
						) : null}

						{selectedPrinter && (
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<Badge variant={selectedPrinter.reachable ? "default" : "destructive"}>
									{selectedPrinter.reachable ? selectedPrinter.state : t("print.unreachable")}
								</Badge>
								{selectedPrinter.markerNames.map((name, index) => (
									<Badge key={name} variant="outline">
										{t("print.markerLevel", {
											name,
											level: selectedPrinter.markerLevels[index] ?? "?",
										})}
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
