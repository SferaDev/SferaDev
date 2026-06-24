"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import type { Orientation, PaperSize } from "@/lib/layout/types";
import {
	type BridgePrinter,
	DEFAULT_BRIDGE_URL,
	listBridgePrinters,
	resolveBridgeUrl,
} from "@/lib/print/bridge-client";
import { executePrint } from "@/lib/print/index";
import type { EventPrintConfig, PrintMethod } from "@/lib/print/types";

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
}

export function PrintSettingsSection({ data, onChange, primaryColor }: PrintSettingsSectionProps) {
	const t = useTranslations("dashboard.eventSettings");

	// Print bridge "Test connection" + "Test print" state. Scoped here because it
	// is only meaningful while the print section is mounted.
	const [bridgePrinters, setBridgePrinters] = useState<BridgePrinter[]>([]);
	const [bridgeTesting, setBridgeTesting] = useState(false);
	const [bridgeError, setBridgeError] = useState<string | null>(null);
	const [testPrinting, setTestPrinting] = useState(false);

	const printConfig: EventPrintConfig = {
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

	const handleTestBridge = async () => {
		setBridgeTesting(true);
		setBridgeError(null);
		try {
			// A blank URL is valid: it means "use the mDNS default the bridge
			// advertises". Test that resolved default so an operator relying on
			// auto-discovery can still verify the bridge instead of being stuck with a
			// disabled button and no idea whether anything is reachable.
			const result = await listBridgePrinters(resolveBridgeUrl(data.printBridgeUrl));
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
			setBridgeTesting(false);
		}
	};

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
			if (blob) await executePrint(blob, printConfig);
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
								onClick={handleTestBridge}
								disabled={bridgeTesting}
							>
								{bridgeTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
						<Select
							value={data.printPrinterId || "none"}
							onValueChange={(value) => onChange({ printPrinterId: value === "none" ? "" : value })}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder={t("print.selectPrinter")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">{t("print.noPrinterSelected")}</SelectItem>
								{data.printPrinterId &&
									!bridgePrinters.some((p) => p.id === data.printPrinterId) && (
										<SelectItem value={data.printPrinterId}>
											{t("print.printerSaved", { id: data.printPrinterId })}
										</SelectItem>
									)}
								{bridgePrinters.map((printer) => (
									<SelectItem key={printer.id} value={printer.id}>
										{printer.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
