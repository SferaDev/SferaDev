import type { ReactNode } from "react";
import { KioskI18nProvider } from "@/components/kiosk-i18n-provider";
import { KioskReliability } from "@/components/kiosk-reliability";
import { OfflineSync } from "@/components/offline-sync";

/**
 * Kiosk layout. Wraps the whole guest flow in {@link KioskI18nProvider} so every
 * kiosk screen renders in the guest's chosen language (no URL locale prefixes;
 * messages are bundled for offline use). Also hosts the offline-sync indicator
 * so the photo outbox is drained across the whole flow (attract → consent →
 * capture → result) and keeps working through network drops once the kiosk has
 * been opened.
 */
export default function KioskLayout({ children }: { children: ReactNode }) {
	return (
		<KioskI18nProvider>
			{children}
			<OfflineSync />
			<KioskReliability />
		</KioskI18nProvider>
	);
}
