/**
 * Single shared kiosk camera stream.
 *
 * The kiosk flow (attract → select → capture → result) historically called
 * `getUserMedia` separately on the select (live preview) and capture screens,
 * so iOS prompted for camera permission twice and re-prompted often. This module
 * holds ONE module-level `MediaStream` for the whole kiosk session and hands the
 * same live stream to every screen, so `getUserMedia` is called exactly once and
 * reused across the entire flow.
 *
 * The stream stays alive while the guest moves between kiosk screens (the kiosk
 * layout persists across them) and is only released when the kiosk layout itself
 * unmounts — i.e. when the device leaves the kiosk entirely.
 *
 * IMPORTANT: we deliberately never call `enumerateDevices`/`enumerateCameras`
 * here. Priming device labels requires its own `getUserMedia` probe, which on
 * iOS triggers an extra permission prompt — exactly what this module exists to
 * avoid. The capture device is therefore selected via a `deviceId` constraint
 * built from the event settings rather than by matching enumerated labels.
 */

import type { getPublicEvent } from "@/actions/events";

type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;

/** The currently cached live stream, or null when none is active. */
let activeStream: MediaStream | null = null;
/**
 * An in-flight acquisition. Concurrent `acquireSharedStream` calls (e.g. the
 * select and capture screens mounting close together) coalesce onto this single
 * promise so only one `getUserMedia` ever runs.
 */
let pendingAcquire: Promise<MediaStream> | null = null;

/**
 * Whether a `MediaStream` still has at least one live track. A stream whose
 * track has ended (camera unplugged, OS reclaimed it) must not be reused — we
 * re-acquire a fresh one instead.
 */
function isStreamLive(stream: MediaStream): boolean {
	return stream.getVideoTracks().some((track) => track.readyState === "live");
}

/**
 * Build the `getUserMedia` constraints for an event. Prefers an explicitly
 * selected capture device (USB webcam chosen in admin) via `deviceId`, otherwise
 * falls back to the configured front/back facing mode. Width/height are
 * requested at 1080p but kept as `ideal` so the browser can downscale rather
 * than reject when the device can't deliver it.
 */
export function kioskCameraConstraints(event: PublicEvent): MediaStreamConstraints {
	const video: MediaTrackConstraints = event.cameraDeviceId
		? { deviceId: { ideal: event.cameraDeviceId } }
		: { facingMode: event.defaultCamera ?? "user" };

	video.width = { ideal: 1920 };
	video.height = { ideal: 1080 };

	return { video, audio: false };
}

/**
 * Whether the kiosk feed should be mirrored for this event. Governed by the
 * host's `mirrorPhotos` setting (defaults on, matching how guests expect to see
 * themselves in a selfie). Applied identically to the live preview and the
 * captured frame so what the guest sees is what gets saved.
 */
export function kioskCameraMirror(event: PublicEvent): boolean {
	return event.mirrorPhotos;
}

/**
 * Return the shared kiosk stream, acquiring it via `getUserMedia` on first call
 * and reusing the cached live stream on every subsequent call. Concurrent calls
 * coalesce onto a single acquisition. Re-acquires automatically if the cached
 * stream's track has ended.
 */
export async function acquireSharedStream(
	constraints: MediaStreamConstraints,
): Promise<MediaStream> {
	if (activeStream && isStreamLive(activeStream)) {
		return activeStream;
	}
	// A previously cached stream whose track ended: drop it before re-acquiring.
	if (activeStream) {
		releaseSharedStream();
	}
	if (pendingAcquire) {
		return pendingAcquire;
	}

	if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
		throw new Error("Camera is not available in this environment.");
	}

	pendingAcquire = navigator.mediaDevices
		.getUserMedia(constraints)
		.then((stream) => {
			activeStream = stream;
			return stream;
		})
		.finally(() => {
			pendingAcquire = null;
		});

	return pendingAcquire;
}

/** The cached live stream, or null when none has been acquired (no side effects). */
export function getSharedStream(): MediaStream | null {
	if (activeStream && !isStreamLive(activeStream)) {
		releaseSharedStream();
	}
	return activeStream;
}

/**
 * Stop and forget the shared stream. Called when the kiosk layout unmounts so
 * the camera light goes off when leaving the kiosk; a no-op when no stream is
 * active.
 */
export function releaseSharedStream(): void {
	if (activeStream) {
		for (const track of activeStream.getTracks()) {
			track.stop();
		}
		activeStream = null;
	}
}
