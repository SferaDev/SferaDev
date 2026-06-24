"use client";

import {
	AlertCircle,
	ArrowLeft,
	Check,
	Clapperboard,
	Download,
	Loader2,
	RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { createPhoto, generatePhotoUploadUrl } from "@/actions/photos";
import { completeSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";
import { type CameraFacing, useCamera } from "@/hooks/use-camera";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import {
	BOOMERANG_FRAME_DELAY_MS,
	encodeBoomerangGif,
	recordBoomerangFrames,
	toPalindrome,
} from "@/lib/boomerang/encode";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR, PRIMARY_CTA_CLASS } from "@/lib/branding";
import { downloadBlob } from "@/lib/canvas-utils";
import { enqueuePhoto } from "@/lib/offline-queue";
import { cn } from "@/lib/utils";

/** ServiceWorkerRegistration with the optional Background Sync extension. */
interface SyncCapableRegistration extends ServiceWorkerRegistration {
	sync?: { register(tag: string): Promise<void> };
}

/**
 * The boomerang flow is a self-contained state machine. Unlike the photo-strip
 * flow it has no template/personalize/print steps — record, encode, preview,
 * then share.
 */
type Stage = "ready" | "countdown" | "recording" | "processing" | "preview" | "uploading" | "done";

/** Grace period (ms) after the camera is ready before the boomerang auto-starts,
 * so guests can settle into frame. Mirrors the photo capture screen. */
const AUTO_START_DELAY_MS = 800;

export default function KioskBoomerangPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const t = useTranslations("kiosk.boomerang");
	const tCommon = useTranslations("kiosk.common");
	const tResult = useTranslations("kiosk.result");
	const tLoading = useTranslations("kiosk.loading");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const {
		videoRef,
		isReady,
		error: cameraError,
		start,
	} = useCamera({
		defaultFacing: (event?.defaultCamera as CameraFacing) || "user",
		deviceId: event?.cameraDeviceId ?? null,
		deviceLabel: event?.cameraDeviceLabel ?? null,
	});

	const [stage, setStage] = useState<Stage>("ready");
	const [countdown, setCountdown] = useState<number | null>(null);
	const [recordProgress, setRecordProgress] = useState(0);
	const [encodeProgress, setEncodeProgress] = useState(0);
	const [gifUrl, setGifUrl] = useState<string | null>(null);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [humanCode, setHumanCode] = useState<string | null>(null);
	const [savedOffline, setSavedOffline] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// The encoded GIF blob + its dimensions, held for upload/download/redo.
	const gifRef = useRef<{ blob: Blob; width: number; height: number } | null>(null);
	const { sync } = useOfflineSync();

	useEffect(() => {
		if (event && !isReady) {
			start();
		}
	}, [event, isReady, start]);

	// Auto-return to attract after idle, but never interrupt an in-flight capture.
	useIdleTimeout({
		timeout: event?.idleTimeoutSeconds ?? 120,
		onIdle: () => router.push(`/kiosk/${orgSlug}/${eventSlug}`),
		enabled: !!event && (stage === "ready" || stage === "done"),
	});

	// Revoke object URLs when they are replaced or on unmount to avoid leaks.
	useEffect(() => {
		return () => {
			if (gifUrl) URL.revokeObjectURL(gifUrl);
		};
	}, [gifUrl]);

	// Mirror is governed by the host's `mirrorPhotos` setting (matching the photo
	// capture screen); zoom is the same digital center-crop applied there.
	const mirrored = event?.mirrorPhotos ?? true;
	const zoom = Math.max(1, event?.captureZoom ?? 1);
	const mirrorTransform = `scale(${mirrored ? -zoom : zoom}, ${zoom})`;

	const record = useCallback(async () => {
		if (!event || !videoRef.current || !isReady) return;
		setError(null);
		setRecordProgress(0);
		setEncodeProgress(0);

		// Animated countdown before recording, mirroring the photo capture screen.
		const seconds = event.captureDefaultCountdown ?? 3;
		setStage("countdown");
		for (let n = seconds; n > 0; n--) {
			setCountdown(n);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		setCountdown(null);

		try {
			setStage("recording");
			const frames = await recordBoomerangFrames({
				video: videoRef.current,
				mirrored,
				zoom,
				onProgress: setRecordProgress,
			});

			setStage("processing");
			const looped = toPalindrome(frames);
			const blob = await encodeBoomerangGif(looped, {
				frameDelayMs: BOOMERANG_FRAME_DELAY_MS,
				onProgress: setEncodeProgress,
			});

			const result = { blob, width: frames[0].width, height: frames[0].height };
			gifRef.current = result;
			const url = URL.createObjectURL(result.blob);
			setGifUrl(url);
			setStage("preview");
		} catch (err) {
			console.error("Boomerang capture failed:", err);
			setError(t("captureFailed"));
			setStage("ready");
		}
	}, [event, videoRef, isReady, mirrored, zoom, t]);

	// Auto-start: begin recording automatically once the camera is ready, so
	// guests don't have to tap to start (governed by the same captureAutoStart
	// setting as the photo screen). Fires once; a redo afterwards is a manual tap,
	// so a flaky camera never loops the guest into endless auto-records.
	const autoStart = event?.captureAutoStart ?? true;
	const recordRef = useRef(record);
	useEffect(() => {
		recordRef.current = record;
	}, [record]);
	const autoStartedRef = useRef(false);
	useEffect(() => {
		if (!autoStart || !isReady || stage !== "ready") return;
		if (autoStartedRef.current) return;
		autoStartedRef.current = true;
		const timer = setTimeout(() => {
			void recordRef.current();
		}, AUTO_START_DELAY_MS);
		return () => clearTimeout(timer);
	}, [autoStart, isReady, stage]);

	const redo = useCallback(() => {
		if (gifUrl) URL.revokeObjectURL(gifUrl);
		setGifUrl(null);
		gifRef.current = null;
		setStage("ready");
	}, [gifUrl]);

	const share = useCallback(async () => {
		const captured = gifRef.current;
		if (!event || !sessionId || !captured) return;

		setStage("uploading");
		setError(null);
		const { blob, width, height } = captured;

		try {
			const { uploadUrl, key } = await generatePhotoUploadUrl(event.id, "image/gif");
			await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": "image/gif" },
				body: blob,
			});

			const result = await createPhoto({
				eventId: event.id,
				sessionId,
				storageKey: key,
				kind: "boomerang",
				width,
				height,
				sizeBytes: blob.size,
			});

			await completeSession(sessionId);

			const shareBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
			const shareLink = `${shareBaseUrl}/share/${result.shareToken}`;
			setHumanCode(result.humanCode);

			if (event.showQrCode) {
				const qr = await QRCode.toDataURL(shareLink, {
					width: 256,
					margin: 2,
					color: { dark: "#000000", light: "#ffffff" },
				});
				setQrCodeUrl(qr);
			}
		} catch (uploadErr) {
			// Offline / upload failure: hold the GIF in the outbox so it is never
			// lost; background sync finishes it on reconnect. The guest can still
			// download now.
			console.warn("Deferring boomerang upload to offline outbox:", uploadErr);
			await enqueuePhoto({
				id: crypto.randomUUID(),
				eventId: event.id,
				sessionId,
				blob,
				contentType: "image/gif",
				kind: "boomerang",
				width,
				height,
				queuedAt: Date.now(),
			});

			try {
				const registration = (await navigator.serviceWorker?.ready) as
					| SyncCapableRegistration
					| undefined;
				await registration?.sync?.register("photocall-photo-sync");
			} catch {
				// Background Sync unsupported — the `online` event still triggers a flush.
			}

			setSavedOffline(true);
			void sync();
		}

		setStage("done");
	}, [event, sessionId, sync]);

	const handleDownload = useCallback(() => {
		const captured = gifRef.current;
		if (!captured) return;
		downloadBlob(captured.blob, `photocall-${humanCode || "boomerang"}.gif`);
	}, [humanCode]);

	const handleNew = useCallback(() => {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
	}, [router, orgSlug, eventSlug]);

	if (eventLoading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center bg-black text-white"
				role="status"
				aria-label={tLoading("label")}
			>
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	if (!event.boomerangEnabled) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}/select?session=${sessionId}`);
		return null;
	}

	const primaryColor = event.primaryColor || DEFAULT_BRAND_COLOR;

	// ── Result screen (shared GIF + QR + download, no print) ──
	if (stage === "done") {
		return (
			<div className="min-h-screen bg-black text-white p-8">
				<div className="max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center mb-8"
					>
						<div className="inline-flex items-center gap-2 bg-green-600 px-4 py-2 rounded-full mb-4">
							<Check className="h-5 w-5" />
							<span className="font-medium">{tResult("photoSaved")}</span>
						</div>
						<h1 className="text-3xl font-bold">
							{event.thankYouMessage || tResult("defaultThankYou")}
						</h1>
					</motion.div>

					<div className="grid md:grid-cols-2 gap-8">
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ type: "spring", stiffness: 220, damping: 22 }}
							className="rounded-lg overflow-hidden bg-white/5 flex items-center justify-center"
						>
							{gifUrl && (
								<img
									src={gifUrl}
									alt={t("resultAlt")}
									className="w-full h-full object-contain max-h-[70vh]"
								/>
							)}
						</motion.div>

						<div className="flex flex-col justify-center space-y-6">
							{savedOffline && (
								<div className="text-center p-4 bg-amber-500/15 border border-amber-500/30 rounded-lg">
									<p className="text-sm font-medium text-amber-200">
										{tResult("savedOfflineTitle")}
									</p>
									<p className="text-sm text-white/60 mt-1">{tResult("savedOfflineDescription")}</p>
								</div>
							)}

							{humanCode && (
								<div className="text-center p-4 bg-white/10 rounded-lg">
									<p className="text-sm text-white/60 mb-1">{tResult("photoCode")}</p>
									<p className="text-3xl font-mono font-bold tracking-wider">{humanCode}</p>
								</div>
							)}

							{event.showQrCode && qrCodeUrl && (
								<div className="flex flex-col items-center p-6 bg-white rounded-lg">
									<img src={qrCodeUrl} alt={tResult("scanToView")} className="w-40 h-40" />
									<p className="text-black text-sm mt-2">{tResult("scanToView")}</p>
								</div>
							)}

							{event.allowDownload && (
								<Button
									size="lg"
									variant="outline"
									onClick={handleDownload}
									className="bg-transparent border-white/20 text-white hover:bg-white/10"
								>
									<Download className="h-5 w-5 mr-2" />
									{tResult("download")}
								</Button>
							)}

							<Button
								size="xl"
								onClick={handleNew}
								className={cn(PRIMARY_CTA_CLASS, BRANDED_CTA_FEEDBACK, "w-full")}
								style={{ backgroundColor: primaryColor }}
							>
								<Clapperboard className="h-5 w-5 mr-2" />
								{tResult("takeAnother")}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ── Capture / preview screen ──
	const isBusy =
		stage === "countdown" ||
		stage === "recording" ||
		stage === "processing" ||
		stage === "uploading";

	return (
		<div className="min-h-screen bg-black text-white relative overflow-hidden">
			{/* Camera preview (hidden once we have a GIF to show) */}
			<div className="absolute inset-0">
				{stage === "preview" && gifUrl ? (
					<img src={gifUrl} alt={t("resultAlt")} className="w-full h-full object-cover" />
				) : (
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className="w-full h-full object-cover"
						style={{ transform: mirrorTransform }}
					/>
				)}
			</div>

			{/* Top prompt */}
			<div className="absolute top-0 inset-x-0 p-6 z-30 flex justify-center">
				<motion.div
					key={stage}
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					className="px-5 py-2 rounded-full bg-black/40 backdrop-blur text-lg font-semibold"
				>
					{stage === "recording"
						? t("recording")
						: stage === "processing"
							? t("processing")
							: stage === "preview"
								? t("previewHint")
								: t("ready")}
				</motion.div>
			</div>

			{/* Countdown overlay */}
			<AnimatePresence mode="wait">
				{countdown !== null && (
					<motion.div
						key={countdown}
						className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
						initial={{ scale: 0.4, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 1.6, opacity: 0 }}
						transition={{ type: "spring", stiffness: 320, damping: 18 }}
					>
						<span className="text-[200px] font-bold text-white drop-shadow-lg leading-none">
							{countdown}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Recording ring */}
			<AnimatePresence>
				{stage === "recording" && (
					<motion.div
						className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
							<title>{t("recording")}</title>
							<circle
								cx="110"
								cy="110"
								r="100"
								fill="none"
								stroke="rgba(255,255,255,0.2)"
								strokeWidth="8"
							/>
							<motion.circle
								cx="110"
								cy="110"
								r="100"
								fill="none"
								stroke={primaryColor}
								strokeWidth="8"
								strokeLinecap="round"
								strokeDasharray={2 * Math.PI * 100}
								strokeDashoffset={2 * Math.PI * 100 * (1 - recordProgress)}
								transform="rotate(-90 110 110)"
							/>
						</svg>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Processing / uploading overlay */}
			{(stage === "processing" || stage === "uploading") && (
				<div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70">
					<Loader2 className="h-16 w-16 animate-spin mb-4" />
					<p className="text-xl">{stage === "uploading" ? t("sharing") : t("processing")}</p>
					{stage === "processing" && encodeProgress > 0 && encodeProgress < 1 && (
						<div className="mt-4 h-2 w-48 overflow-hidden rounded-full bg-white/15">
							<div
								className="h-full rounded-full"
								style={{
									width: `${Math.round(encodeProgress * 100)}%`,
									backgroundColor: primaryColor,
								}}
							/>
						</div>
					)}
				</div>
			)}

			{/* Controls */}
			<div className="absolute inset-x-0 bottom-0 p-8 z-30">
				<div className="flex items-center justify-between max-w-2xl mx-auto">
					<Button
						variant="ghost"
						size="lg"
						aria-label={tCommon("back")}
						onClick={() =>
							router.push(`/kiosk/${orgSlug}/${eventSlug}/select?session=${sessionId}`)
						}
						className="text-white"
						disabled={isBusy}
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>

					{stage === "preview" ? (
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="xl"
								onClick={redo}
								className={cn(
									PRIMARY_CTA_CLASS,
									"bg-transparent border-white/30 text-white hover:bg-white/10",
								)}
							>
								<RotateCcw className="h-5 w-5 mr-2" />
								{t("redo")}
							</Button>
							<Button
								size="xl"
								onClick={() => void share()}
								className={cn(PRIMARY_CTA_CLASS, BRANDED_CTA_FEEDBACK)}
								style={{ backgroundColor: primaryColor }}
							>
								<Check className="h-5 w-5 mr-2" />
								{t("keep")}
							</Button>
						</div>
					) : (
						<Button
							size="lg"
							aria-label={t("recordBoomerang")}
							onClick={() => void record()}
							disabled={!isReady || isBusy}
							className={cn("h-20 w-20 rounded-full", BRANDED_CTA_FEEDBACK)}
							style={{ backgroundColor: primaryColor }}
						>
							<Clapperboard className="h-10 w-10" />
						</Button>
					)}

					<div className="w-12" />
				</div>
			</div>

			{/* Camera starting overlay — keeps guests informed while getUserMedia
			    initializes instead of showing a black screen with a dead button.
			    Sits below the controls (z-30) so Back stays reachable if the camera
			    never comes up; the error overlay (z-40) wins once it rejects. */}
			{stage === "ready" && !isReady && !cameraError && (
				<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-8">
					<Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: primaryColor }} />
					<p className="text-white/70 text-lg">{tCommon("startingCamera")}</p>
				</div>
			)}

			{/* Camera error overlay */}
			{cameraError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">{t("cameraErrorTitle")}</h2>
					<p className="text-white/60 mb-8 text-center">{cameraError}</p>
					<Button
						size="lg"
						onClick={() => start()}
						className={BRANDED_CTA_FEEDBACK}
						style={{ backgroundColor: primaryColor }}
					>
						<RotateCcw className="h-5 w-5 mr-2" />
						{tCommon("tryAgain")}
					</Button>
				</div>
			)}

			{/* Capture error overlay */}
			{error && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">{t("captureFailedTitle")}</h2>
					<p className="text-white/60 mb-8 text-center">{error}</p>
					<Button
						size="lg"
						onClick={() => setError(null)}
						className={BRANDED_CTA_FEEDBACK}
						style={{ backgroundColor: primaryColor }}
					>
						<RotateCcw className="h-5 w-5 mr-2" />
						{tCommon("tryAgain")}
					</Button>
				</div>
			)}
		</div>
	);
}
