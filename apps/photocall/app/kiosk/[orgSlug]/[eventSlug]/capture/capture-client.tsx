"use client";

import { AlertCircle, ArrowLeft, Camera, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { saveCapture } from "@/actions/sessions";
import { Button } from "@/components/ui/button";
import { type CameraFacing, useCamera } from "@/hooks/use-camera";

export default function KioskCapturePage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const templateId = searchParams.get("template");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { videoRef, isReady, error, start, switchCamera, capture } = useCamera({
		defaultFacing: (event?.defaultCamera as CameraFacing) || "user",
	});

	const [countdown, setCountdown] = useState<number | null>(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const [flash, setFlash] = useState(false);
	const [captureError, setCaptureError] = useState<string | null>(null);

	useEffect(() => {
		if (event && !isReady) {
			start();
		}
	}, [event, isReady, start]);

	const handleCapture = useCallback(async () => {
		if (countdown !== null || isCapturing) return;

		// Start countdown
		setCountdown(3);
		const countdownInterval = setInterval(() => {
			setCountdown((prev) => {
				if (prev === null || prev <= 1) {
					clearInterval(countdownInterval);
					return null;
				}
				return prev - 1;
			});
		}, 1000);

		// Wait for countdown
		await new Promise((resolve) => setTimeout(resolve, 3000));

		setIsCapturing(true);
		setFlash(true);
		setTimeout(() => setFlash(false), 200);

		try {
			const imageUrl = capture();
			if (imageUrl && sessionId) {
				await saveCapture(sessionId, imageUrl);
				router.push(
					`/kiosk/${orgSlug}/${eventSlug}/personalize?session=${sessionId}${templateId ? `&template=${templateId}` : ""}`,
				);
			}
		} catch (err) {
			console.error("Capture failed:", err);
			setCaptureError("Failed to capture photo. Please try again.");
		} finally {
			setIsCapturing(false);
		}
	}, [countdown, isCapturing, capture, sessionId, router, orgSlug, eventSlug, templateId]);

	if (eventLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	const primaryColor = event.primaryColor || "#6366f1";

	return (
		<div className="min-h-screen bg-black text-white relative">
			{/* Camera View */}
			<div className="absolute inset-0">
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className="w-full h-full object-cover"
					style={{ transform: event.defaultCamera === "user" ? "scaleX(-1)" : "none" }}
				/>
			</div>

			{/* Flash Effect */}
			{flash && <div className="absolute inset-0 bg-white z-50" />}

			{/* Countdown Overlay */}
			{countdown !== null && (
				<div className="absolute inset-0 flex items-center justify-center z-40">
					<span className="text-[200px] font-bold text-white drop-shadow-lg animate-pulse">
						{countdown}
					</span>
				</div>
			)}

			{/* Controls */}
			<div className="absolute inset-x-0 bottom-0 p-8 z-30">
				<div className="flex items-center justify-between max-w-2xl mx-auto">
					<Button
						variant="ghost"
						size="lg"
						onClick={() =>
							router.push(`/kiosk/${orgSlug}/${eventSlug}/select?session=${sessionId}`)
						}
						className="text-white"
						disabled={countdown !== null}
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>

					<Button
						size="lg"
						onClick={handleCapture}
						disabled={countdown !== null || isCapturing || !isReady}
						className="h-20 w-20 rounded-full"
						style={{ backgroundColor: primaryColor }}
					>
						<Camera className="h-10 w-10" />
					</Button>

					<Button
						variant="ghost"
						size="lg"
						onClick={switchCamera}
						className="text-white"
						disabled={countdown !== null}
					>
						<RefreshCw className="h-6 w-6" />
					</Button>
				</div>
			</div>

			{/* Camera Error Overlay */}
			{error && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">Camera Error</h2>
					<p className="text-white/60 mb-8 text-center">{error}</p>
					<Button size="lg" onClick={() => start()} style={{ backgroundColor: primaryColor }}>
						<RotateCcw className="h-5 w-5 mr-2" />
						Try Again
					</Button>
				</div>
			)}

			{/* Capture Error Overlay */}
			{captureError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">Capture Failed</h2>
					<p className="text-white/60 mb-8 text-center">{captureError}</p>
					<Button
						size="lg"
						onClick={() => setCaptureError(null)}
						style={{ backgroundColor: primaryColor }}
					>
						<RotateCcw className="h-5 w-5 mr-2" />
						Try Again
					</Button>
				</div>
			)}
		</div>
	);
}
