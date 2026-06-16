"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { useOfflineSync } from "@/hooks/use-offline-sync";

/**
 * Kiosk-wide offline indicator. Mounted once in the kiosk layout so the photo
 * outbox is drained whenever connectivity returns, and so staff can see at a
 * glance when the booth is offline or has photos still waiting to upload.
 *
 * Renders nothing while everything is online and synced.
 */
export function OfflineSync() {
	const { online, pending } = useOfflineSync();

	if (online && pending === 0) return null;

	return (
		<div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
			{!online && (
				<>
					<CloudOff className="h-4 w-4 text-red-400" />
					<span>Offline</span>
				</>
			)}
			{pending > 0 && (
				<>
					{online && <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />}
					<span>
						{pending} photo{pending === 1 ? "" : "s"} waiting to sync
					</span>
				</>
			)}
		</div>
	);
}
