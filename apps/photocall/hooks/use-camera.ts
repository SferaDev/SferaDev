"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";

interface UseCameraOptions {
	defaultFacing?: CameraFacing;
	maxWidth?: number;
	maxHeight?: number;
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

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
	const { defaultFacing = "user", maxWidth = 1920, maxHeight = 1080 } = options;

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facing, setFacing] = useState<CameraFacing>(defaultFacing);

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
			// Stop any existing stream
			if (stream) {
				for (const track of stream.getTracks()) {
					track.stop();
				}
			}

			const constraints: MediaStreamConstraints = {
				video: {
					facingMode: facing,
					width: { ideal: maxWidth },
					height: { ideal: maxHeight },
				},
				audio: false,
			};

			const newStream = await navigator.mediaDevices.getUserMedia(constraints);
			setStream(newStream);

			if (videoRef.current) {
				videoRef.current.srcObject = newStream;
				await videoRef.current.play();
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
	}, [facing, maxWidth, maxHeight, stream]);

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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (stream) {
				for (const track of stream.getTracks()) {
					track.stop();
				}
			}
		};
	}, [stream]);

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
