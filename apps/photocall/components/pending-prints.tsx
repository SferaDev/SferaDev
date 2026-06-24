"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePrintSync } from "@/hooks/use-print-sync";

interface PendingPrintsProps {
	/**
	 * Resolved bridge base URL when bridge printing is configured, else null. Null
	 * disables the drain and hides the notice (manual/no printing has no outbox).
	 */
	bridgeUrl: string | null;
}

/**
 * Persistent "prints are waiting" indicator. Mirrors {@link OfflineSync}'s
 * "N photos waiting to sync" pill (same fixed bottom corner, same pill styling)
 * so the booth operator gets a consistent at-a-glance signal — but for prints,
 * not photo uploads.
 *
 * Why this matters: running out of paper/ink is common and slow to fix, and the
 * no-loss queue holds every print and retries it forever. Without a notice the
 * operator would have no idea prints are stacking up behind an out-of-paper
 * printer. This surfaces the count and, when known, WHY (the last failure reason
 * — e.g. bridge unreachable / printer rejected) so they can act. The drain runs
 * automatically the moment the bridge recovers; the notice clears itself then.
 *
 * Renders nothing when no prints are pending. Sits on the LEFT-bottom by default
 * but is offset to the RIGHT so it never overlaps the offline-sync pill when a
 * booth is both offline AND has prints queued.
 */
export function PendingPrints({ bridgeUrl }: PendingPrintsProps) {
	const { pending, reason } = usePrintSync(bridgeUrl);
	const t = useTranslations("kiosk.print");

	if (pending === 0) return null;

	return (
		<div
			className="fixed right-4 bottom-4 z-50 flex max-w-xs items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
			role="status"
		>
			<Printer className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
			<span className="truncate">
				{/* Deliberately NOT styled as success — a queued print has not printed
				    yet. The amber printer icon + "waiting" copy reads as "pending". */}
				{reason
					? t("pendingWithReason", { count: pending, reason })
					: t("pending", { count: pending })}
			</span>
		</div>
	);
}
