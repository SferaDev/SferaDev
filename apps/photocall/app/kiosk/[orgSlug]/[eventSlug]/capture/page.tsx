"use client";

export const dynamic = "force-dynamic";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Camera, Loader2, RefreshCw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCamera } from "@/hooks/use-camera";

export default function KioskCapturePage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session") as Id<"sessions"> | null;
	const templateId = searchParams.get("template") as Id<"templates"> | null;

	const event = useQuery(api.events.getPublic, {
		organizationSlug: orgSlug,
		eventSlug: eventSlug,
	});

	const saveCapture = useMutation(api.sessions.saveCapture);

	const { videoRef, isReady, error, start, switchCamera, capture } = useCamera({
		defaultFacing: event?.defaultCamera || "user",
	});

	const [countdown, setCountdown] = useState<number | null>(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const [flash, setFlash] = useState(false);

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
				await saveCapture({ sessionId, capturedImageUrl: imageUrl });
				router.push(
					`/kiosk/${orgSlug}/${eventSlug}/personalize?session=${sessionId}${templateId ? `&template=${templateId}` : ""}`,
				);
			}
		} catch (err) {
			console.error("Capture failed:", err);
		} finally {
			setIsCapturing(false);
		}
	}, [
		countdown,
		isCapturing,
		capture,
		sessionId,
		saveCapture,
		router,
		orgSlug,
		eventSlug,
		templateId,
	]);

	if (event === undefined) {
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

			{/* Error Message */}
			{error && (
				<div className="absolute top-8 left-1/2 -translate-x-1/2 bg-destructive text-white px-4 py-2 rounded-lg z-40">
					{error}
				</div>
			)}
		</div>
	);
}
