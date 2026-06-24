"use client";

import { useEffect } from "react";
import { releaseSharedStream } from "@/lib/kiosk-camera-stream";

/**
 * Releases the shared kiosk camera stream when the kiosk layout unmounts.
 *
 * The shared stream (see {@link "@/lib/kiosk-camera-stream"}) is intentionally
 * kept alive across every screen of the guest flow so `getUserMedia` is called
 * only once. The kiosk layout is the one component that spans the whole flow, so
 * stopping the stream on ITS unmount (and not on any inner screen's unmount)
 * turns the camera off exactly when the device leaves the kiosk — while leaving
 * it running for subsequent guests within the same kiosk session.
 *
 * Rendered for its unmount effect only; it renders nothing.
 */
export function KioskCameraCleanup() {
	useEffect(() => {
		return () => {
			releaseSharedStream();
		};
	}, []);

	return null;
}
