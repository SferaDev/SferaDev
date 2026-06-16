"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";

interface UseCameraOptions {
	defaultFacing?: CameraFacing;
	maxWidth?: number;
	maxHeight?: number;
	/** Preferred capture device id (e.g. a USB webcam selected in admin). */
	deviceId?: string | null;
	/** Label of the preferred device — used to re-match if the id has changed. */
	deviceLabel?: string | null;
}

interface UseCameraReturn {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	isReady: boolean;
	isLoading: boolean;
	error: string | null;
	facing: CameraFacing;
	stream: MediaStream | null;
	start: () => Promise<void>;
	stop: () => void;
	switchCamera: () => Promise<void>;
	capture: () => string | null;
	captureBlob: () => Promise<Blob | null>;
}

/**
 * Enumerate available video input devices. Calls getUserMedia once first so the
 * browser populates device labels (they are blank until permission is granted).
 */
export async function enumerateCameras(): Promise<MediaDeviceInfo[]> {
	if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
		return [];
	}

	try {
		// Prime labels: without an active/prior permission grant, enumerateDevices
		// returns devices with empty labels.
		const probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
		for (const track of probe.getTracks()) track.stop();
	} catch {
		// Permission denied or no camera — still return whatever we can enumerate.
	}

	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices.filter((device) => device.kind === "videoinput");
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
	const {
		defaultFacing = "user",
		maxWidth = 1920,
		maxHeight = 1080,
		deviceId = null,
		deviceLabel = null,
	} = options;

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	// Mirrors `stream` so concurrent start() calls and the unmount cleanup can
	// always reach the currently active stream synchronously (state is stale
	// inside an in-flight async start()), preventing leaked MediaStreams.
	const streamRef = useRef<MediaStream | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facing, setFacing] = useState<CameraFacing>(defaultFacing);

	useEffect(() => {
		streamRef.current = stream;
	}, [stream]);

	const stop = useCallback(() => {
		if (stream) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
			setStream(null);
		}
		setIsReady(false);
	}, [stream]);

	const start = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Stop any existing stream. Use the ref (not the `stream` state, which
			// is stale inside this async closure) so concurrent start() calls don't
			// leak the previously-acquired MediaStream.
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
				streamRef.current = null;
			}

			// Resolve the preferred capture device. If a stored deviceId is gone,
			// fall back to matching by label, otherwise to facingMode.
			let resolvedDeviceId: string | null = null;
			if (deviceId || deviceLabel) {
				try {
					const cameras = await enumerateCameras();
					const byId = deviceId
						? cameras.find((camera) => camera.deviceId === deviceId)
						: undefined;
					const byLabel =
						!byId && deviceLabel
							? cameras.find((camera) => camera.label === deviceLabel)
							: undefined;
					resolvedDeviceId = (byId ?? byLabel)?.deviceId ?? null;
				} catch {
					// Enumeration failed — fall back to facingMode below.
				}
			}

			const videoConstraints: MediaTrackConstraints = resolvedDeviceId
				? {
						deviceId: { ideal: resolvedDeviceId },
						width: { ideal: maxWidth },
						height: { ideal: maxHeight },
					}
				: {
						facingMode: facing,
						width: { ideal: maxWidth },
						height: { ideal: maxHeight },
					};

			const constraints: MediaStreamConstraints = {
				video: videoConstraints,
				audio: false,
			};

			const newStream = await navigator.mediaDevices.getUserMedia(constraints);
			streamRef.current = newStream;
			setStream(newStream);

			if (videoRef.current) {
				const video = videoRef.current;
				video.srcObject = newStream;
				try {
					await video.play();
				} catch (playErr) {
					// play() commonly rejects with an AbortError when a re-render or
					// camera switch attaches a new stream mid-play, and some browsers
					// reject until the element is muted/visible. Neither is fatal — the
					// stream is attached and playback resumes — so only surface real
					// errors here.
					if (playErr instanceof Error && playErr.name !== "AbortError") {
						throw playErr;
					}
				}
				setIsReady(true);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to access camera";
			if (message.includes("Permission denied") || message.includes("NotAllowedError")) {
				setError("Camera access denied. Please allow camera access to continue.");
			} else if (message.includes("NotFoundError") || message.includes("DevicesNotFoundError")) {
				setError("No camera found. Please connect a camera and try again.");
			} else {
				setError(message);
			}
			setIsReady(false);
		} finally {
			setIsLoading(false);
		}
	}, [facing, maxWidth, maxHeight, deviceId, deviceLabel]);

	const switchCamera = useCallback(async () => {
		const newFacing = facing === "user" ? "environment" : "user";
		setFacing(newFacing);
	}, [facing]);

	// Restart camera when facing changes
	useEffect(() => {
		if (stream) {
			start();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [facing]);

	const capture = useCallback((): string | null => {
		if (!videoRef.current || !canvasRef.current || !isReady) {
			return null;
		}

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		if (!ctx) return null;

		// Set canvas size to match video
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// Draw the video frame
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Return as data URL
		return canvas.toDataURL("image/jpeg", 0.95);
	}, [isReady]);

	const captureBlob = useCallback(async (): Promise<Blob | null> => {
		if (!videoRef.current || !canvasRef.current || !isReady) {
			return null;
		}

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		if (!ctx) return null;

		// Set canvas size to match video
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// Draw the video frame
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Return as blob
		return new Promise((resolve) => {
			canvas.toBlob(
				(blob) => {
					resolve(blob);
				},
				"image/jpeg",
				0.95,
			);
		});
	}, [isReady]);

	// Cleanup on unmount. Stops whatever stream is currently active via the ref
	// so an in-flight start() that hasn't committed to state can't leak.
	useEffect(() => {
		return () => {
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
				streamRef.current = null;
			}
		};
	}, []);

	return {
		videoRef,
		canvasRef,
		isReady,
		isLoading,
		error,
		facing,
		stream,
		start,
		stop,
		switchCamera,
		capture,
		captureBlob,
	};
}
