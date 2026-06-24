"use client";

import { useCallback, useEffect, useState } from "react";
import type { getPublicEvent } from "@/actions/events";
import {
	acquireSharedStream,
	getSharedStream,
	kioskCameraConstraints,
	kioskCameraMirror,
} from "@/lib/kiosk-camera-stream";

type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;

export interface KioskCamera {
	/** The shared live stream, or null while acquiring / on error. */
	stream: MediaStream | null;
	/** Human-readable camera error, or null. Drives the retry overlay. */
	error: string | null;
	/** Whether the feed should be mirrored, matching the kiosk capture rule. */
	mirror: boolean;
	/** Whether the shared stream is acquired and ready to render/capture. */
	ready: boolean;
	/** Re-acquire the shared stream (used by the error/retry overlay). */
	retry: () => void;
}

/**
 * Acquire (or reuse) the one shared kiosk camera stream for `event` and expose
 * it to a kiosk screen. Every screen in the flow calls this with the same event,
 * so they all share a single `getUserMedia` — the stream is acquired once and
 * cached in {@link "@/lib/kiosk-camera-stream"} until the kiosk layout unmounts.
 *
 * Returns `{ stream, error, mirror, ready }`. While `event` is undefined or the
 * stream is being acquired, `stream` is null and `ready` is false. On a denied
 * permission / missing camera, `error` is set and `retry()` re-attempts.
 */
export function useKioskCamera(event: PublicEvent | undefined): KioskCamera {
	const [stream, setStream] = useState<MediaStream | null>(() => getSharedStream());
	const [error, setError] = useState<string | null>(null);

	const acquire = useCallback(() => {
		if (!event) return;
		setError(null);
		acquireSharedStream(kioskCameraConstraints(event))
			.then((acquired) => {
				setStream(acquired);
			})
			.catch((err: unknown) => {
				const message = err instanceof Error ? err.message : "Failed to access camera";
				if (message.includes("Permission denied") || message.includes("NotAllowedError")) {
					setError("Camera access denied. Please allow camera access to continue.");
				} else if (message.includes("NotFoundError") || message.includes("DevicesNotFoundError")) {
					setError("No camera found. Please connect a camera and try again.");
				} else {
					setError(message);
				}
				setStream(null);
			});
	}, [event]);

	useEffect(() => {
		if (!event) return;
		// Reuse the cached stream if one is already live; otherwise acquire it.
		const existing = getSharedStream();
		if (existing) {
			setStream(existing);
			return;
		}
		acquire();
	}, [event, acquire]);

	const mirror = event ? kioskCameraMirror(event) : false;

	return { stream, error, mirror, ready: stream !== null && error === null, retry: acquire };
}
