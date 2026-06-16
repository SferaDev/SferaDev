import type { ReactNode } from "react";
import { OfflineSync } from "@/components/offline-sync";

/**
 * Kiosk layout. Hosts the offline-sync indicator so the photo outbox is drained
 * across the whole kiosk flow (attract → consent → capture → result) and keeps
 * working through network drops once the kiosk has been opened.
 */
export default function KioskLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<OfflineSync />
		</>
	);
}
