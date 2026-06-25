"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { getPublicEvent } from "@/actions/events";
import {
	acquireSharedStream,
	getSharedStream,
	KioskCameraError,
	type KioskCameraErrorKind,
	kioskCameraConstraintsChain,
	kioskCameraMirror,
} from "@/lib/kiosk-camera-stream";

type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;

export interface KioskCamera {
	/** The shared live stream, or null while acquiring / on error. */
	stream: MediaStream | null;
	/** Localized human-readable camera error, or null. Drives the retry overlay. */
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
 * Returns `{ stream, error, mirror, ready, retry }`. While `event` is undefined
 * or the stream is being acquired, `stream` is null and `ready` is false. The
 * underlying acquisition tries the event's preferred capture device first and
 * falls back to the default facing mode / any camera when it is unavailable, and
 * bounds each attempt with a timeout — so a missing webcam or a hung device
 * surfaces a localized `error` (with a working `retry()`) instead of leaving the
 * guest on an endless spinner / black screen.
 */
export function useKioskCamera(event: PublicEvent | undefined): KioskCamera {
	const t = useTranslations("kiosk.camera");
	const [stream, setStream] = useState<MediaStream | null>(() => getSharedStream());
	const [errorKind, setErrorKind] = useState<KioskCameraErrorKind | null>(null);
	// Guards against a stale in-flight acquisition committing its result after a
	// newer retry (or an unmount) has superseded it — and against React 18
	// StrictMode double-invoking the effect from kicking off two acquisitions.
	const acquireTokenRef = useRef(0);

	const acquire = useCallback(() => {
		if (!event) return;
		const token = acquireTokenRef.current + 1;
		acquireTokenRef.current = token;
		setErrorKind(null);

		acquireSharedStream(kioskCameraConstraintsChain(event))
			.then((acquired) => {
				// Ignore a result that a newer acquire()/unmount has superseded.
				if (acquireTokenRef.current !== token) return;
				setStream(acquired);
			})
			.catch((err: unknown) => {
				if (acquireTokenRef.current !== token) return;
				const kind = err instanceof KioskCameraError ? err.kind : "unknown";
				setErrorKind(kind);
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
		return () => {
			// Invalidate any in-flight acquisition so its late result can't land on a
			// screen that has since unmounted or changed events.
			acquireTokenRef.current += 1;
		};
	}, [event, acquire]);

	const mirror = event ? kioskCameraMirror(event) : false;
	const error = errorKind === null ? null : t(ERROR_MESSAGE_KEYS[errorKind]);

	return {
		stream,
		error,
		mirror,
		ready: stream !== null && errorKind === null,
		retry: acquire,
	};
}

/** Maps each camera-error kind to its message key under the `kiosk.camera` namespace. */
const ERROR_MESSAGE_KEYS: Record<KioskCameraErrorKind, string> = {
	"permission-denied": "errorPermissionDenied",
	"no-camera": "errorNoCamera",
	"in-use": "errorInUse",
	timeout: "errorTimeout",
	unsupported: "errorUnsupported",
	unknown: "errorUnknown",
};
