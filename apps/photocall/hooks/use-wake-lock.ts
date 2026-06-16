"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseWakeLockReturn {
	/** Whether the screen wake lock is currently held. */
	active: boolean;
	/** Whether the Screen Wake Lock API is available in this browser. */
	supported: boolean;
}

/**
 * Holds a Screen Wake Lock so the kiosk display never sleeps mid-event.
 *
 * The platform releases wake locks automatically whenever the tab is
 * backgrounded (e.g. the OS switches apps or the screen is briefly locked), so
 * we re-acquire on every `visibilitychange` back to `visible`. Where the API is
 * unsupported the hook is a graceful no-op.
 */
export function useWakeLock(enabled = true): UseWakeLockReturn {
	const [active, setActive] = useState(false);
	const sentinelRef = useRef<WakeLockSentinel | null>(null);

	const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;

	const release = useCallback(async () => {
		const sentinel = sentinelRef.current;
		sentinelRef.current = null;
		if (sentinel) {
			try {
				await sentinel.release();
			} catch {
				// Already released — nothing to do.
			}
		}
		setActive(false);
	}, []);

	const acquire = useCallback(async () => {
		if (!supported || document.visibilityState !== "visible") return;
		if (sentinelRef.current) return;
		try {
			const sentinel = await navigator.wakeLock.request("screen");
			sentinelRef.current = sentinel;
			setActive(true);
			// The browser fires `release` if it drops the lock for us; reflect that.
			sentinel.addEventListener("release", () => {
				if (sentinelRef.current === sentinel) {
					sentinelRef.current = null;
					setActive(false);
				}
			});
		} catch {
			// Request can reject (e.g. low battery); leave it unheld and retry on
			// the next visibility change.
			setActive(false);
		}
	}, [supported]);

	useEffect(() => {
		if (!enabled || !supported) return;

		void acquire();

		const handleVisibility = () => {
			if (document.visibilityState === "visible") {
				void acquire();
			}
		};
		document.addEventListener("visibilitychange", handleVisibility);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibility);
			void release();
		};
	}, [enabled, supported, acquire, release]);

	return { active, supported };
}
