"use client";

import { useEffect } from "react";

/**
 * Hardens the kiosk against accidental exits on an unattended iPad. Adds a
 * `kiosk-locked` class to the document (CSS in globals.css disables text
 * selection, pull-to-refresh/overscroll and the iOS tap-highlight) and attaches
 * listeners that suppress the context menu and multi-touch pinch-zoom gestures.
 *
 * Inputs and buttons are intentionally left interactive: the CSS re-enables
 * `user-select` on form fields and we never call `preventDefault` on single
 * touches, so taps, typing and scrolling all continue to work.
 */
export function KioskLockdown() {
	useEffect(() => {
		document.documentElement.classList.add("kiosk-locked");

		const preventContextMenu = (event: Event) => event.preventDefault();

		// Block pinch-zoom: iOS Safari fires non-standard gesture* events, while
		// other browsers zoom on multi-touch — guard both without breaking taps.
		const preventGesture = (event: Event) => event.preventDefault();
		const preventMultiTouch = (event: TouchEvent) => {
			if (event.touches.length > 1) event.preventDefault();
		};

		document.addEventListener("contextmenu", preventContextMenu);
		document.addEventListener("gesturestart", preventGesture);
		document.addEventListener("gesturechange", preventGesture);
		document.addEventListener("touchmove", preventMultiTouch, { passive: false });

		return () => {
			document.documentElement.classList.remove("kiosk-locked");
			document.removeEventListener("contextmenu", preventContextMenu);
			document.removeEventListener("gesturestart", preventGesture);
			document.removeEventListener("gesturechange", preventGesture);
			document.removeEventListener("touchmove", preventMultiTouch);
		};
	}, []);

	return null;
}
