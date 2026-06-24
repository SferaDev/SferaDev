"use client";

import { Loader2, Printer, RefreshCw, RotateCw, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { getPublicEvent } from "@/actions/events";
import { getPublicEventOpsSnapshot } from "@/actions/ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { countQueuedPhotos } from "@/lib/offline-queue";
import { type BridgePrinter, listBridgePrinters, pingBridge } from "@/lib/print/bridge-client";
import { countQueuedPrints } from "@/lib/print/print-queue";

type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;

interface KioskOperatorPanelProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event: PublicEvent;
	orgSlug: string;
	eventSlug: string;
	/**
	 * The kiosk PIN validated for this admin session. Forwarded to
	 * {@link getPublicEventOpsSnapshot} so the snapshot is authorized
	 * server-side (the anonymous panel has no user session).
	 */
	pin: string;
}

/** A single printer's readiness derived from its CUPS state/reasons. */
type PrinterReadiness = "ready" | "out-of-paper" | "not-ready";

function readPrinterReadiness(printer: BridgePrinter): PrinterReadiness {
	const reasons = printer.stateReasons.join(" ").toLowerCase();
	if (reasons.includes("media-empty") || reasons.includes("media-needed")) {
		return "out-of-paper";
	}
	return printer.state.toLowerCase() === "idle" || printer.reachable ? "ready" : "not-ready";
}

/**
 * PIN-gated operator panel surfaced from the attract screen's admin escape.
 * Shows live booth status (sessions today, pending prints/uploads, connectivity
 * and — for bridge printing — bridge/printer reachability) plus quick recovery
 * actions. Reuses {@link useAdminAuth}: the parent only renders this when the
 * operator is authenticated.
 */
export function KioskOperatorPanel({
	open,
	onOpenChange,
	event,
	orgSlug,
	eventSlug,
	pin,
}: KioskOperatorPanelProps) {
	const t = useTranslations("kiosk.ops");

	const isBridge = event.printMethod === "bridge";
	const bridgeUrl = event.printBridgeUrl;

	const [online, setOnline] = useState(true);
	const [sessionsToday, setSessionsToday] = useState<number | null>(null);
	const [completedToday, setCompletedToday] = useState<number | null>(null);
	const [pendingPrints, setPendingPrints] = useState<number | null>(null);
	const [pendingUploads, setPendingUploads] = useState<number | null>(null);
	const [bridgeReachable, setBridgeReachable] = useState<boolean | null>(null);
	const [printer, setPrinter] = useState<{ name: string; readiness: PrinterReadiness } | null>(
		null,
	);
	const [refreshing, setRefreshing] = useState(false);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

		const [snapshot, prints, uploads] = await Promise.all([
			getPublicEventOpsSnapshot(event.id, pin).catch(() => null),
			countQueuedPrints().catch(() => null),
			countQueuedPhotos().catch(() => null),
		]);
		setSessionsToday(snapshot?.sessionsToday ?? null);
		setCompletedToday(snapshot?.completedToday ?? null);
		setPendingPrints(prints);
		setPendingUploads(uploads);

		if (isBridge && bridgeUrl) {
			const reachable = await pingBridge(bridgeUrl);
			setBridgeReachable(reachable);
			if (reachable) {
				const result = await listBridgePrinters(bridgeUrl);
				if (result.ok) {
					const target =
						result.printers.find((p) => p.id === event.printPrinterId) ?? result.printers[0];
					setPrinter(
						target ? { name: target.name, readiness: readPrinterReadiness(target) } : null,
					);
				} else {
					setPrinter(null);
				}
			} else {
				setPrinter(null);
			}
		}

		setRefreshing(false);
	}, [event.id, event.printPrinterId, isBridge, bridgeUrl, pin]);

	useEffect(() => {
		if (open) void refresh();
	}, [open, refresh]);

	const printerStatus = (() => {
		if (!printer) return { label: t("printerUnknown"), variant: "secondary" as const };
		switch (printer.readiness) {
			case "ready":
				return { label: t("printerReady"), variant: "default" as const };
			case "out-of-paper":
				return { label: t("printerOutOfPaper"), variant: "destructive" as const };
			default:
				return { label: t("printerUnknown"), variant: "secondary" as const };
		}
	})();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{t("title")}</DialogTitle>
					<DialogDescription>{t("subtitle")}</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3">
					<Stat label={t("sessionsToday")} value={sessionsToday} />
					<Stat label={t("completedToday")} value={completedToday} />
					<Stat label={t("pendingPrints")} value={pendingPrints} />
					<Stat label={t("pendingUploads")} value={pendingUploads} />
				</div>

				<Separator />

				<div className="space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-muted-foreground">
							{online ? (
								<Wifi className="h-4 w-4" aria-hidden="true" />
							) : (
								<WifiOff className="h-4 w-4" aria-hidden="true" />
							)}
							{t("connectivity")}
						</span>
						<Badge variant={online ? "default" : "destructive"}>
							{online ? t("online") : t("offline")}
						</Badge>
					</div>

					{isBridge ? (
						<>
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-2 text-muted-foreground">
									<Printer className="h-4 w-4" aria-hidden="true" />
									{t("bridge")}
								</span>
								<Badge
									variant={
										bridgeReachable == null
											? "secondary"
											: bridgeReachable
												? "default"
												: "destructive"
									}
								>
									{bridgeReachable == null
										? "—"
										: bridgeReachable
											? t("bridgeReachable")
											: t("bridgeUnreachable")}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-2 text-muted-foreground">
									<Printer className="h-4 w-4" aria-hidden="true" />
									{t("printer")}
								</span>
								<Badge variant={printerStatus.variant}>{printerStatus.label}</Badge>
							</div>
						</>
					) : null}
				</div>

				<Separator />

				<div className="grid gap-2">
					<Button variant="outline" onClick={() => void refresh()} disabled={refreshing}>
						{refreshing ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
						) : (
							<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
						)}
						{t("refresh")}
					</Button>
					<Button variant="outline" onClick={() => window.location.reload()}>
						<RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
						{t("reloadKiosk")}
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/dashboard/${orgSlug}/${eventSlug}`}>{t("exitToDashboard")}</Link>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function Stat({ label, value }: { label: string; value: number | null }) {
	return (
		<div className="rounded-lg border p-3">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="text-2xl font-bold">{value ?? "—"}</div>
		</div>
	);
}
