"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Camera, Loader2, RefreshCw, RotateCcw, SwitchCamera } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCamera } from "@/hooks/use-camera";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

function CapturePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session") as Id<"sessions"> | null;
	const templateId = searchParams.get("template") as Id<"templates"> | null;

	const settings = useQuery(api.settings.get);
	const template = useQuery(api.templates.get, templateId ? { templateId } : "skip");
	const saveCapture = useMutation(api.sessions.saveCapture);

	const {
		videoRef,
		canvasRef,
		isReady,
		isLoading: cameraLoading,
		error: cameraError,
		facing,
		start,
		stop,
		switchCamera,
		capture,
	} = useCamera({
		defaultFacing: settings?.defaultCamera ?? "user",
	});

	const [countdown, setCountdown] = useState<number | null>(null);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Idle timeout
	useIdleTimeout({
		timeout: settings?.idleTimeoutSeconds ?? 60,
		onIdle: () => router.push("/kiosk"),
		enabled: !countdown && !capturedImage,
	});

	// Start camera on mount
	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	const handleCapture = useCallback(() => {
		if (!isReady) return;

		// Start countdown
		setCountdown(3);
	}, [isReady]);

	// Countdown effect
	useEffect(() => {
		if (countdown === null) return;

		if (countdown === 0) {
			// Take the photo
			const imageData = capture();
			if (imageData) {
				setCapturedImage(imageData);
			}
			setCountdown(null);
			return;
		}

		const timer = setTimeout(() => {
			setCountdown(countdown - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown, capture]);

	const handleRetake = () => {
		setCapturedImage(null);
		start();
	};

	const handleAccept = async () => {
		if (!capturedImage || !sessionId) return;

		setIsProcessing(true);
		try {
			await saveCapture({ sessionId, capturedImageUrl: capturedImage });
			router.push(`/kiosk/personalize?session=${sessionId}&template=${templateId ?? ""}`);
		} catch (error) {
			console.error("Failed to save capture:", error);
			setIsProcessing(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4">
				<Link href={`/kiosk/select`}>
					<Button variant="ghost" size="lg" className="gap-2">
						<ArrowLeft className="h-6 w-6" />
						Back
					</Button>
				</Link>
				<h1 className="text-xl font-bold md:text-2xl">
					{capturedImage ? "Preview" : "Strike a Pose!"}
				</h1>
				<div className="w-24" />
			</div>

			{/* Camera/Preview Area */}
			<div className="relative flex flex-1 items-center justify-center p-4">
				<div className="relative aspect-[3/4] w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl">
					{/* Camera Error */}
					{cameraError && !capturedImage && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-8 text-center">
							<Camera className="mb-4 h-16 w-16 text-muted-foreground" />
							<p className="mb-4 text-lg font-medium">{cameraError}</p>
							<Button onClick={start} size="lg">
								<RefreshCw className="mr-2 h-5 w-5" />
								Try Again
							</Button>
						</div>
					)}

					{/* Camera Loading */}
					{cameraLoading && !capturedImage && (
						<div className="absolute inset-0 flex items-center justify-center bg-muted">
							<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
						</div>
					)}

					{/* Live Camera Feed */}
					{!capturedImage && (
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className={`h-full w-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
						/>
					)}

					{/* Captured Image Preview */}
					{capturedImage && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={capturedImage}
							alt="Captured"
							className={`h-full w-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
						/>
					)}

					{/* Template Overlay Preview */}
					{template?.url && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={template.url}
							alt="Frame"
							className="pointer-events-none absolute inset-0 h-full w-full object-contain"
						/>
					)}

					{/* Countdown Overlay */}
					{countdown !== null && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50">
							<span className="animate-pulse text-[200px] font-bold text-white drop-shadow-2xl">
								{countdown || "📸"}
							</span>
						</div>
					)}

					{/* Hidden canvas for capture */}
					<canvas ref={canvasRef} className="hidden" />
				</div>
			</div>

			{/* Controls */}
			<div className="p-6">
				{!capturedImage ? (
					<div className="flex items-center justify-center gap-4">
						<Button
							variant="outline"
							size="xl"
							onClick={switchCamera}
							disabled={!isReady || countdown !== null}
							className="h-16 w-16 rounded-full p-0"
						>
							<SwitchCamera className="h-8 w-8" />
						</Button>
						<Button
							size="xl"
							onClick={handleCapture}
							disabled={!isReady || countdown !== null}
							className="h-24 w-24 rounded-full p-0 text-2xl shadow-2xl"
						>
							<Camera className="h-12 w-12" />
						</Button>
						<div className="h-16 w-16" /> {/* Spacer */}
					</div>
				) : (
					<div className="flex items-center justify-center gap-4">
						<Button
							variant="outline"
							size="xl"
							onClick={handleRetake}
							disabled={isProcessing}
							className="gap-2"
						>
							<RotateCcw className="h-6 w-6" />
							Retake
						</Button>

						<Button size="xl" onClick={handleAccept} disabled={isProcessing} className="gap-2">
							{isProcessing ? (
								<>
									<Loader2 className="h-6 w-6 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Camera className="h-6 w-6" />
									Use This Photo
								</>
							)}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export default function CapturePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
				</div>
			}
		>
			<CapturePageContent />
		</Suspense>
	);
}
