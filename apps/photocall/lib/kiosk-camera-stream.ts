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

/**
 * How long a single `getUserMedia` attempt may run before we treat it as hung
 * and reject it. A flaky USB webcam (or an OS that is still releasing the device
 * from another app) can leave `getUserMedia` pending forever; without this bound
 * the kiosk would sit on an infinite spinner / black screen with no way out. On
 * timeout we surface an error + retry instead.
 */
const GET_USER_MEDIA_TIMEOUT_MS = 12_000;

/**
 * How a camera acquisition failed, in a form the UI can map to a localized
 * message. `permission-denied` means the guest must grant access; the rest mean
 * the device side is the problem (missing, in use, or hung).
 */
export type KioskCameraErrorKind =
	| "permission-denied"
	| "no-camera"
	| "in-use"
	| "timeout"
	| "unsupported"
	| "unknown";

/**
 * A camera acquisition failure carrying a {@link KioskCameraErrorKind} so the
 * hook can pick the right localized message without re-parsing browser error
 * strings (which vary across engines).
 */
export class KioskCameraError extends Error {
	readonly kind: KioskCameraErrorKind;

	constructor(kind: KioskCameraErrorKind, message: string) {
		super(message);
		this.name = "KioskCameraError";
		this.kind = kind;
	}
}

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
 * Build the ordered list of `getUserMedia` constraints to try for an event,
 * most-specific first. We attempt them in order and fall through to the next
 * when one rejects with a "this device can't satisfy the request" error
 * (`OverconstrainedError` / `NotFoundError`) — which is exactly what happens when
 * the kiosk moves to a machine that lacks the saved capture device:
 *
 *  1. The explicitly selected capture device (USB webcam chosen in admin), by
 *     `deviceId`. Using `exact` here means a missing device rejects rather than
 *     silently picking a random camera, so we can deliberately fall back.
 *  2. The configured front/back `facingMode` (or "user" by default).
 *  3. A bare `{ video: true }` — accept whatever camera exists, so the booth
 *     still works on a laptop/tablet that has a camera but not the saved one.
 *
 * Width/height are requested at 1080p but kept as `ideal` so the browser can
 * downscale rather than reject when the device can't deliver it.
 */
export function kioskCameraConstraintsChain(event: PublicEvent): MediaStreamConstraints[] {
	const dimensions: Pick<MediaTrackConstraints, "width" | "height"> = {
		width: { ideal: 1920 },
		height: { ideal: 1080 },
	};

	const facingMode = event.defaultCamera ?? "user";
	const chain: MediaStreamConstraints[] = [];

	if (event.cameraDeviceId) {
		chain.push({
			video: { deviceId: { exact: event.cameraDeviceId }, ...dimensions },
			audio: false,
		});
	}
	chain.push({ video: { facingMode, ...dimensions }, audio: false });
	chain.push({ video: true, audio: false });

	return chain;
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
 * Whether a `getUserMedia` rejection means "this specific device/constraint
 * can't be satisfied" (so we should try the next fallback) rather than a hard
 * stop like a denied permission. `OverconstrainedError` is raised when an
 * `exact` constraint (our pinned `deviceId`) has no match; `NotFoundError` when
 * there is no device at all for the requested kind.
 */
function isConstraintFallbackError(error: unknown): boolean {
	if (!(error instanceof DOMException)) return false;
	return (
		error.name === "OverconstrainedError" ||
		error.name === "NotFoundError" ||
		error.name === "DevicesNotFoundError"
	);
}

/** Translate a raw `getUserMedia` rejection into a typed {@link KioskCameraError}. */
function toKioskCameraError(error: unknown): KioskCameraError {
	if (error instanceof KioskCameraError) return error;
	if (error instanceof DOMException) {
		switch (error.name) {
			case "NotAllowedError":
			case "SecurityError":
				return new KioskCameraError("permission-denied", error.message);
			case "NotFoundError":
			case "DevicesNotFoundError":
			case "OverconstrainedError":
				return new KioskCameraError("no-camera", error.message);
			case "NotReadableError":
			case "TrackStartError":
			case "AbortError":
				return new KioskCameraError("in-use", error.message);
			default:
				return new KioskCameraError("unknown", error.message);
		}
	}
	const message = error instanceof Error ? error.message : "Failed to access camera";
	return new KioskCameraError("unknown", message);
}

/**
 * Run a single `getUserMedia` call with a bounded timeout. If the browser never
 * settles within {@link GET_USER_MEDIA_TIMEOUT_MS} we reject with a `timeout`
 * error AND stop any stream that arrives late, so a hung device can't leak a
 * track or resolve after we've moved on.
 */
function getUserMediaWithTimeout(constraints: MediaStreamConstraints): Promise<MediaStream> {
	return new Promise<MediaStream>((resolve, reject) => {
		let settled = false;
		const timer = setTimeout(() => {
			if (settled) return;
			settled = true;
			reject(new KioskCameraError("timeout", "Camera timed out while starting."));
		}, GET_USER_MEDIA_TIMEOUT_MS);

		navigator.mediaDevices.getUserMedia(constraints).then(
			(stream) => {
				if (settled) {
					// We already timed out and gave up on this attempt; don't leak it.
					for (const track of stream.getTracks()) track.stop();
					return;
				}
				settled = true;
				clearTimeout(timer);
				resolve(stream);
			},
			(error: unknown) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

/**
 * Try each constraint set in {@link kioskCameraConstraintsChain} order, falling
 * through to the next only on a "device unavailable" error so a missing pinned
 * webcam degrades to the default camera instead of getting stuck. A
 * permission-denied (or any non-fallback error) stops immediately — retrying
 * other constraints won't help and would re-prompt. The last fallback's error is
 * what surfaces if every attempt fails.
 */
async function acquireWithFallback(chain: MediaStreamConstraints[]): Promise<MediaStream> {
	let lastError: unknown;
	for (let i = 0; i < chain.length; i++) {
		try {
			return await getUserMediaWithTimeout(chain[i]);
		} catch (error) {
			lastError = error;
			const isLast = i === chain.length - 1;
			if (isLast || !isConstraintFallbackError(error)) {
				throw toKioskCameraError(error);
			}
			// Otherwise fall through and try the next, less-specific constraint.
		}
	}
	throw toKioskCameraError(lastError);
}

/**
 * Return the shared kiosk stream, acquiring it via `getUserMedia` on first call
 * and reusing the cached live stream on every subsequent call. Concurrent calls
 * coalesce onto a single acquisition. Re-acquires automatically if the cached
 * stream's track has ended. Tries the event's preferred device first and falls
 * back to the default facing mode / any camera when it is unavailable, and bounds
 * each attempt with a timeout so a hung device surfaces an error rather than
 * hanging forever.
 */
export async function acquireSharedStream(chain: MediaStreamConstraints[]): Promise<MediaStream> {
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
		throw new KioskCameraError("unsupported", "Camera is not available in this environment.");
	}

	pendingAcquire = acquireWithFallback(chain)
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
