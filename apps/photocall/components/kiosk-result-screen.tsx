"use client";

import { Camera, Check, Loader2, Printer, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BRANDED_CTA_FEEDBACK } from "@/lib/branding";
import type { PrintJobStatus } from "@/lib/print/types";
import { cn } from "@/lib/utils";

/** Print affordance for the result screen. Omitted entirely for boomerangs,
 * which can't be printed. */
export interface KioskResultPrint {
	status: PrintJobStatus;
	onPrint: () => void;
}

interface KioskResultScreenProps {
	/** The composed photo (strip/single) or boomerang GIF to show. */
	mediaUrl: string | null;
	mediaAlt: string;
	/** Scan-to-view QR. Shown only when the event enables it and one is ready. */
	qrCodeUrl: string | null;
	showQr: boolean;
	/** Whether the photo is held in the offline outbox (will upload on reconnect). */
	savedOffline: boolean;
	primaryColor: string;
	onNewPhoto: () => void;
	print?: KioskResultPrint;
}

/**
 * The unified kiosk end-of-session screen, shared by the photo-strip/single
 * result and the boomerang result so both look identical. A two-column layout:
 * the captured media on the left, the scan-to-view QR plus the primary actions
 * on the right. Deliberately minimal — no "saved!" badge, no thank-you heading,
 * no photo code and no on-kiosk download — so guests scan the QR to get their
 * photo and the host's flow stays fast for the next guest.
 */
export function KioskResultScreen({
	mediaUrl,
	mediaAlt,
	qrCodeUrl,
	showQr,
	savedOffline,
	primaryColor,
	onNewPhoto,
	print,
}: KioskResultScreenProps) {
	const t = useTranslations("kiosk.result");

	// "queued" (bridge offline, will print on reconnect) and "done" both count as
	// a successful hand-off to the print queue — surface positive feedback on the
	// button itself rather than a separate status line.
	const printQueued = print?.status === "done" || print?.status === "queued";
	const printing = print?.status === "printing";
	const printFailed = print?.status === "failed";

	return (
		<div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
			<div className="grid w-full max-w-6xl items-center gap-6 md:grid-cols-2">
				{/* Captured media */}
				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: "spring", stiffness: 220, damping: 22 }}
					className="flex items-center justify-center overflow-hidden rounded-3xl bg-white/5"
				>
					{mediaUrl && (
						<img src={mediaUrl} alt={mediaAlt} className="max-h-[88vh] w-full object-contain" />
					)}
				</motion.div>

				{/* Actions */}
				<div className="flex flex-col gap-5">
					{savedOffline && (
						<div className="rounded-2xl border border-amber-500/30 bg-amber-500/15 p-5">
							<p className="text-lg font-semibold text-amber-200">{t("savedOfflineTitle")}</p>
							<p className="mt-1 text-base text-white/60">{t("savedOfflineDescription")}</p>
						</div>
					)}

					{showQr && qrCodeUrl && (
						<div className="flex flex-col items-center rounded-3xl bg-white p-6">
							<img src={qrCodeUrl} alt={t("scanToView")} className="h-60 w-60" />
							<p className="mt-3 text-center text-xl font-medium text-black">{t("scanToView")}</p>
						</div>
					)}

					{print && (
						<Button
							size="xl"
							onClick={print.onPrint}
							disabled={printing || printQueued}
							className={cn(
								"w-full rounded-full border-2 bg-transparent py-7 text-2xl font-semibold",
								BRANDED_CTA_FEEDBACK,
								printQueued
									? "border-green-500 bg-green-600 text-white hover:bg-green-600 disabled:opacity-100"
									: "border-white/25 text-white hover:bg-white/10",
							)}
						>
							{printing ? (
								<Loader2 className="mr-3 h-7 w-7 animate-spin" />
							) : printQueued ? (
								<Check className="mr-3 h-7 w-7" />
							) : printFailed ? (
								<RotateCcw className="mr-3 h-7 w-7" />
							) : (
								<Printer className="mr-3 h-7 w-7" />
							)}
							{printing
								? t("sendingToPrinter")
								: printQueued
									? t("addedToQueue")
									: printFailed
										? t("retryPrint")
										: t("print")}
						</Button>
					)}

					<Button
						size="xl"
						onClick={onNewPhoto}
						className={cn(
							"w-full rounded-full py-7 text-2xl font-semibold shadow-lg",
							BRANDED_CTA_FEEDBACK,
						)}
						style={{ backgroundColor: primaryColor }}
					>
						<Camera className="mr-3 h-7 w-7" />
						{t("takeAnother")}
					</Button>
				</div>
			</div>
		</div>
	);
}
