"use client";

import type { getPublicEvent } from "@/actions/events";
import { useKioskCamera } from "@/hooks/use-kiosk-camera";

type PublicEvent = Awaited<ReturnType<typeof getPublicEvent>>;

interface KioskPreviewCamera {
	/** The live stream once ready, or null while loading / on error. */
	stream: MediaStream | null;
	/** Whether the preview feed should be mirrored, matching kiosk capture. */
	mirror: boolean;
}

/**
 * Provide the kiosk template-picker live preview feed.
 *
 * This is a thin adapter over {@link useKioskCamera}: it returns the ONE shared
 * kiosk stream (the same stream the capture screen uses), so the picker shows the
 * real camera and no extra `getUserMedia` prompt is triggered.
 *
 * Previously this gated `stream` on `useCamera`'s `isReady`, which only flips
 * true once a `<video>` is bound to that hook's internal ref — which never
 * happened here, so the preview always fell back to the static placeholder. The
 * shared stream has no such phantom-readiness gate: `stream` is the live stream
 * as soon as it is acquired, and stays null (placeholder fallback) only when the
 * camera is genuinely unavailable.
 *
 * Keeps the `{ stream, mirror }` shape so callers need no change.
 */
export function useKioskPreviewCamera(event: PublicEvent | undefined): KioskPreviewCamera {
	const { stream, mirror } = useKioskCamera(event ?? undefined);
	return { stream, mirror };
}
