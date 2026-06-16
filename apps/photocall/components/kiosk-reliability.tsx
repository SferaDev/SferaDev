"use client";

import { useWakeLock } from "@/hooks/use-wake-lock";
import { KioskLockdown } from "./kiosk-lockdown";

/**
 * Mounts the always-on kiosk reliability primitives once at the kiosk root:
 * the Screen Wake Lock (keeps the iPad awake all day) and the lockdown
 * listeners/CSS (prevents accidental exits). Both are graceful no-ops where the
 * underlying APIs are unsupported.
 */
export function KioskReliability() {
	useWakeLock(true);
	return <KioskLockdown />;
}
