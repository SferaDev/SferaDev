"use client";

import { useEffect } from "react";
import type { getPublicEvent } from "@/actions/events";
import { type CameraFacing, useCamera } from "@/hooks/use-camera";

type PublicEvent = Awaited<ReturnType<typeof getPublicEvent>>;

interface KioskPreviewCamera {
	/** The live stream once ready, or null while loading / on error. */
	stream: MediaStream | null;
	/** Whether the feed is ready to render. */
	isReady: boolean;
	/** Whether the preview feed should be mirrored, matching kiosk capture. */
	mirror: boolean;
}

/**
 * Start a single shared camera stream for the kiosk select screen, configured
 * exactly like the capture screen (same facing, device id/label and mirror
 * rule). Multiple `<video>` elements can share the returned `stream`, so this is
 * the one stream behind every template's live slot previews.
 *
 * The stream is started once the event is available and stopped automatically on
 * unmount (handled by `useCamera`). If permission is denied or no camera exists,
 * `stream` stays null and callers fall back to the static placeholder.
 */
export function useKioskPreviewCamera(event: PublicEvent | undefined): KioskPreviewCamera {
	const { stream, isReady, start } = useCamera({
		defaultFacing: (event?.defaultCamera as CameraFacing | undefined) ?? "user",
		deviceId: event?.cameraDeviceId ?? null,
		deviceLabel: event?.cameraDeviceLabel ?? null,
	});

	useEffect(() => {
		if (event && !isReady) {
			void start();
		}
	}, [event, isReady, start]);

	// Same rule as capture: only the built-in front camera is mirrored, so the
	// preview matches what the guest will actually see during capture.
	const mirror = event?.defaultCamera === "user" && !event?.cameraDeviceId;

	return { stream: isReady ? stream : null, isReady, mirror };
}
