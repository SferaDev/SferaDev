import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicEvent } from "@/actions/events";
import { KioskCameraCleanup } from "@/components/kiosk-camera-cleanup";
import { KioskI18nProvider } from "@/components/kiosk-i18n-provider";
import { KioskReliability } from "@/components/kiosk-reliability";
import { OfflineSync } from "@/components/offline-sync";

/**
 * Per-kiosk PWA metadata: link the event-scoped manifest (start_url = this kiosk)
 * so "Add to Home Screen" installs an icon that opens the kiosk directly instead
 * of the site root, and mark the page as an iOS web-app so it launches
 * standalone/fullscreen with the event's name.
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ orgSlug: string; eventSlug: string }>;
}): Promise<Metadata> {
	const { orgSlug, eventSlug } = await params;
	const base = `/kiosk/${orgSlug}/${eventSlug}`;
	let title = "Photocall";
	try {
		const event = await getPublicEvent(orgSlug, eventSlug);
		if (event?.name) title = event.name;
	} catch {
		// Fall back to the generic title if the event can't be resolved.
	}
	return {
		manifest: `${base}/manifest.webmanifest`,
		appleWebApp: { capable: true, statusBarStyle: "black-translucent", title },
	};
}

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
			<KioskCameraCleanup />
		</KioskI18nProvider>
	);
}
