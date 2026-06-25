"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { getPublicEvent } from "@/actions/events";
import {
	acquireSharedStream,
	getSharedStream,
	getSharedStreamSnapshot,
	KioskCameraError,
	type KioskCameraErrorKind,
	kioskCameraConstraintsChain,
	kioskCameraMirror,
	subscribeSharedStream,
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
	// The shared stream lives in a module-level store; subscribe to it so this
	// screen re-renders the instant the camera is acquired (or released) by ANY
	// screen. Reading it through a store — rather than a one-shot `setState` in
	// the acquiring screen — is what makes the FIRST screen in the flow (the
	// template picker) reliably show the live preview: previously its own update
	// could be dropped, leaving the preview black while later screens worked.
	const stream = useSyncExternalStore(subscribeSharedStream, getSharedStreamSnapshot, () => null);
	const [errorKind, setErrorKind] = useState<KioskCameraErrorKind | null>(null);

	const acquire = useCallback(() => {
		if (!event) return;
		// A live shared stream already exists (acquired by this or another screen):
		// the subscription above already reflects it, so there is nothing to do.
		if (getSharedStream()) return;
		setErrorKind(null);
		// On success the store notifies subscribers (including this hook), so no
		// `setState` for the stream is needed here — only error handling is local.
		void acquireSharedStream(kioskCameraConstraintsChain(event)).catch((err: unknown) => {
			setErrorKind(err instanceof KioskCameraError ? err.kind : "unknown");
		});
	}, [event]);

	useEffect(() => {
		acquire();
	}, [acquire]);

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
