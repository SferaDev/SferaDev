"use client";

import { useCallback, useEffect, useState } from "react";

interface UseFullscreenReturn {
	/** Whether the document is currently presented fullscreen. */
	isFullscreen: boolean;
	/** Whether the Fullscreen API is available in this browser. */
	supported: boolean;
	/** Request fullscreen. Must be called from a user gesture handler. */
	enter: () => Promise<void>;
	/** Leave fullscreen. */
	exit: () => Promise<void>;
}

/**
 * Thin wrapper over the Fullscreen API for kiosk lockdown. Entering fullscreen
 * requires a user gesture, so {@link UseFullscreenReturn.enter} is wired to an
 * explicit affordance on the attract screen. Graceful no-op where unsupported
 * (notably iOS Safari, where standalone PWA install provides the chrome-less
 * experience instead).
 */
export function useFullscreen(): UseFullscreenReturn {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const supported =
		typeof document !== "undefined" &&
		typeof document.documentElement.requestFullscreen === "function";

	const enter = useCallback(async () => {
		if (!supported || document.fullscreenElement) return;
		try {
			await document.documentElement.requestFullscreen();
		} catch {
			// User dismissed the prompt or the gesture was lost — leave windowed.
		}
	}, [supported]);

	const exit = useCallback(async () => {
		if (typeof document === "undefined" || !document.fullscreenElement) return;
		try {
			await document.exitFullscreen();
		} catch {
			// Nothing actionable if exit fails.
		}
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
		handleChange();
		document.addEventListener("fullscreenchange", handleChange);
		return () => document.removeEventListener("fullscreenchange", handleChange);
	}, []);

	return { isFullscreen, supported, enter, exit };
}
