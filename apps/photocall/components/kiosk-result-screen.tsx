"use client";

import { Camera, Check, Clock, Loader2, Printer, RotateCcw } from "lucide-react";
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

	// Distinguish the print states clearly — a queued print has NOT printed yet and
	// must not masquerade as a green "done":
	//  - done     → actually printed (manual/AirPrint) OR handed to the bridge for
	//               immediate printing → GREEN success.
	//  - queued   → bridge was unreachable/printer busy; held in the no-loss outbox
	//               and will print when the bridge recovers → AMBER "pending", not
	//               success. The <PendingPrints> pill tracks it until it drains.
	//  - printing → in flight (spinner).
	//  - failed   → unexpected error; offer a retry.
	const printDone = print?.status === "done";
	const printPending = print?.status === "queued";
	const printing = print?.status === "printing";
	const printFailed = print?.status === "failed";
	// Disable further taps once the job is in flight, printed, or safely queued —
	// re-tapping a pending job would just enqueue a duplicate.
	const printLocked = printing || printDone || printPending;

	return (
		<div className="flex h-[100svh] items-center justify-center overflow-hidden bg-black p-3 text-white sm:p-4">
			<div className="grid max-h-full w-full max-w-6xl items-center gap-4 md:grid-cols-2 md:gap-6">
				{/* Captured media */}
				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: "spring", stiffness: 220, damping: 22 }}
					className="flex min-h-0 items-center justify-center overflow-hidden rounded-3xl bg-white/5"
				>
					{mediaUrl && (
						<img src={mediaUrl} alt={mediaAlt} className="max-h-[88svh] w-full object-contain" />
					)}
				</motion.div>

				{/* Actions */}
				<div className="flex min-h-0 flex-col gap-3 overflow-y-auto sm:gap-5">
					{savedOffline && (
						<div className="rounded-2xl border border-amber-500/30 bg-amber-500/15 p-4 sm:p-5">
							<p className="text-base font-semibold text-amber-200 sm:text-lg">
								{t("savedOfflineTitle")}
							</p>
							<p className="mt-1 text-sm text-white/60 sm:text-base">
								{t("savedOfflineDescription")}
							</p>
						</div>
					)}

					{showQr && qrCodeUrl && (
						<div className="flex flex-col items-center rounded-3xl bg-white p-4 sm:p-6">
							<img
								src={qrCodeUrl}
								alt={t("scanToView")}
								className="h-40 w-40 sm:h-52 sm:w-52 lg:h-60 lg:w-60"
							/>
							<p className="mt-2 text-center text-lg font-medium text-black sm:mt-3 sm:text-xl">
								{t("scanToView")}
							</p>
						</div>
					)}

					{print && (
						<Button
							size="xl"
							onClick={print.onPrint}
							disabled={printLocked}
							// Keep the BUTTON label short so it never overflows the pill. The full
							// "will print when it reconnects" explanation lives in the global
							// <PendingPrints> notice; here we keep it as the accessible label/tooltip.
							aria-label={printPending ? t("printerOffline") : undefined}
							title={printPending ? t("printerOffline") : undefined}
							className={cn(
								"h-auto w-full rounded-full border-2 bg-transparent py-5 text-xl font-semibold sm:py-7 sm:text-2xl",
								BRANDED_CTA_FEEDBACK,
								printDone
									? // Actually printed → green success.
										"border-green-500 bg-green-600 text-white hover:bg-green-600 disabled:opacity-100"
									: printPending
										? // Queued, not yet printed → amber "pending", clearly NOT success.
											"border-amber-500 bg-amber-500/15 text-amber-100 hover:bg-amber-500/15 disabled:opacity-100"
										: "border-white/25 text-white hover:bg-white/10",
							)}
						>
							{printing ? (
								<Loader2 className="mr-3 h-7 w-7 animate-spin" />
							) : printDone ? (
								<Check className="mr-3 h-7 w-7" />
							) : printPending ? (
								<Clock className="mr-3 h-7 w-7" />
							) : printFailed ? (
								<RotateCcw className="mr-3 h-7 w-7" />
							) : (
								<Printer className="mr-3 h-7 w-7" />
							)}
							{printing
								? t("sendingToPrinter")
								: printDone
									? t("addedToQueue")
									: printPending
										? t("printQueued")
										: printFailed
											? t("retryPrint")
											: t("print")}
						</Button>
					)}

					<Button
						size="xl"
						onClick={onNewPhoto}
						className={cn(
							"h-auto w-full rounded-full py-5 text-xl font-semibold shadow-lg sm:py-7 sm:text-2xl",
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
