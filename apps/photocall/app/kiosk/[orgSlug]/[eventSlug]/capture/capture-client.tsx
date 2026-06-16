"use client";

import { AlertCircle, ArrowLeft, Camera, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { saveCapture, saveMultiCapture, updateShotIndex } from "@/actions/sessions";
import { listPublicTemplates } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { type CameraFacing, useCamera } from "@/hooks/use-camera";
import { cssFilterFor } from "@/lib/compose/css-filters";
import { parseLayoutJson } from "@/lib/layout/parse";
import type { FilterKind } from "@/lib/layout/types";
import { writePhotoboothSession } from "@/lib/photobooth-session";

/** Pause (ms) between auto-chained shots so guests can re-pose. */
const AUTO_SHOOT_GAP_MS = 1400;

function isFilterKind(value: string | null): value is FilterKind {
	return (
		value === "none" ||
		value === "bw" ||
		value === "warm" ||
		value === "cool" ||
		value === "faded" ||
		value === "vivid" ||
		value === "noir"
	);
}

export default function KioskCapturePage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const templateId = searchParams.get("template");
	const filterParam = searchParams.get("filter");
	const filter: FilterKind = isFilterKind(filterParam) ? filterParam : "none";

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { data: templates } = useSWR(
		event && templateId ? ["public-templates", event.id] : null,
		() => listPublicTemplates(event!.id),
	);

	const template = templates?.find((t) => t.id === templateId) ?? null;
	const layout = template ? parseLayoutJson(template.layoutJson) : null;
	const shotTotal = layout ? layout.photoSlots.length : 1;
	// The preview filter is the template/guest filter (overrides only matter at compose time).
	const previewFilter: FilterKind = layout ? filter : "none";

	const { videoRef, canvasRef, isReady, error, start, capture } = useCamera({
		defaultFacing: (event?.defaultCamera as CameraFacing) || "user",
		deviceId: event?.cameraDeviceId ?? null,
		deviceLabel: event?.cameraDeviceLabel ?? null,
	});

	const [shots, setShots] = useState<string[]>([]);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [flash, setFlash] = useState(false);
	const [busy, setBusy] = useState(false);
	const [captureError, setCaptureError] = useState<string | null>(null);
	const [finishing, setFinishing] = useState(false);

	useEffect(() => {
		if (event && !isReady) {
			start();
		}
	}, [event, isReady, start]);

	/** Run the animated countdown, then flash + grab a frame. Returns the dataURL. */
	const runCountdownAndCapture = useCallback(async (): Promise<string | null> => {
		const seconds = event?.captureDefaultCountdown ?? 3;
		for (let n = seconds; n > 0; n--) {
			setCountdown(n);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		setCountdown(null);
		setFlash(true);
		setTimeout(() => setFlash(false), 220);
		return capture();
	}, [event?.captureDefaultCountdown, capture]);

	/** Persist shots locally and best-effort to the server. */
	const persist = useCallback(
		(next: string[]) => {
			if (!sessionId) return;
			if (layout) {
				writePhotoboothSession(sessionId, { shots: next, filter });
				void saveMultiCapture(sessionId, next, filter).catch(() => {
					// Offline / server error — sessionStorage remains the source of truth.
				});
			}
		},
		[sessionId, layout, filter],
	);

	const finishSingle = useCallback(
		async (dataUrl: string) => {
			if (!sessionId) return;
			await saveCapture(sessionId, dataUrl);
			router.push(
				`/kiosk/${orgSlug}/${eventSlug}/personalize?session=${sessionId}${templateId ? `&template=${templateId}` : ""}`,
			);
		},
		[sessionId, router, orgSlug, eventSlug, templateId],
	);

	const goToResult = useCallback(() => {
		if (!sessionId) return;
		const query = new URLSearchParams({ session: sessionId });
		if (templateId) query.set("template", templateId);
		query.set("filter", filter);
		router.push(`/kiosk/${orgSlug}/${eventSlug}/result?${query.toString()}`);
	}, [sessionId, templateId, filter, router, orgSlug, eventSlug]);

	/** Capture a single shot for slot `index`, replacing it on a retake. */
	const captureShot = useCallback(
		async (index: number) => {
			if (busy || countdown !== null || !isReady) return;
			setBusy(true);
			setCaptureError(null);
			try {
				const dataUrl = await runCountdownAndCapture();
				if (!dataUrl) throw new Error("Could not read a frame from the camera.");

				// Legacy single-photo template (no layout): keep the existing flow.
				if (!layout) {
					await finishSingle(dataUrl);
					return;
				}

				const next = [...shots];
				next[index] = dataUrl;
				setShots(next);
				persist(next);
				if (sessionId) {
					void updateShotIndex(sessionId, next.filter(Boolean).length).catch(() => {});
				}
			} catch (err) {
				console.error("Capture failed:", err);
				setCaptureError("Failed to capture photo. Please try again.");
			} finally {
				setBusy(false);
			}
		},
		[
			busy,
			countdown,
			isReady,
			runCountdownAndCapture,
			layout,
			finishSingle,
			shots,
			persist,
			sessionId,
		],
	);

	const filledCount = shots.filter(Boolean).length;
	const allShotsTaken = layout != null && filledCount >= shotTotal;

	// Auto-shoot: chain the remaining shots automatically with a short pause.
	const autoShoot = event?.captureAutoShoot ?? false;
	const autoRunningRef = useRef(false);
	useEffect(() => {
		if (!layout || !autoShoot || !isReady) return;
		if (autoRunningRef.current) return;
		if (busy || countdown !== null) return;
		if (filledCount >= shotTotal) return;

		autoRunningRef.current = true;
		const nextIndex = filledCount;
		const timer = setTimeout(() => {
			void captureShot(nextIndex).finally(() => {
				autoRunningRef.current = false;
			});
		}, AUTO_SHOOT_GAP_MS);

		return () => {
			clearTimeout(timer);
			autoRunningRef.current = false;
		};
	}, [layout, autoShoot, isReady, busy, countdown, filledCount, shotTotal, captureShot]);

	const handleFinish = useCallback(() => {
		setFinishing(true);
		goToResult();
	}, [goToResult]);

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

	const primaryColor = event.primaryColor || "#e11d48";
	const nextSlot = filledCount;
	const mirrorTransform =
		event.defaultCamera === "user" && !event.cameraDeviceId ? "scaleX(-1)" : "none";

	return (
		<div className="min-h-screen bg-black text-white relative overflow-hidden">
			{/* Camera View */}
			<div className="absolute inset-0">
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className="w-full h-full object-cover"
					style={{ transform: mirrorTransform, filter: cssFilterFor(previewFilter) }}
				/>
			</div>

			{/* Offscreen canvas used to grab the current video frame on capture */}
			<canvas ref={canvasRef} className="hidden" />

			{/* Flash Effect */}
			<AnimatePresence>
				{flash && (
					<motion.div
						className="absolute inset-0 bg-white z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.9 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18 }}
					/>
				)}
			</AnimatePresence>

			{/* Prompt / progress */}
			{layout && (
				<div className="absolute top-0 inset-x-0 p-6 z-30 flex justify-center">
					<motion.div
						key={`${filledCount}-${countdown}`}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-5 py-2 rounded-full bg-black/40 backdrop-blur text-lg font-semibold"
					>
						{allShotsTaken
							? "All shots captured!"
							: countdown !== null
								? "Pose!"
								: `Shot ${nextSlot + 1} of ${shotTotal}`}
					</motion.div>
				</div>
			)}

			{/* Countdown Overlay */}
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

			{/* Filmstrip of captured thumbnails with retake */}
			{layout && (
				<div className="absolute left-1/2 -translate-x-1/2 bottom-32 z-30 flex gap-3">
					{Array.from({ length: shotTotal }).map((_, index) => {
						const shot = shots[index];
						return (
							<div key={index} className="flex flex-col items-center gap-1">
								<motion.div
									layout
									className="h-20 w-16 rounded-md overflow-hidden border-2 bg-white/10"
									style={{ borderColor: shot ? primaryColor : "rgba(255,255,255,0.3)" }}
								>
									{shot ? (
										<img
											src={shot}
											alt={`Shot ${index + 1}`}
											className="w-full h-full object-cover"
											style={{ filter: cssFilterFor(previewFilter) }}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
											{index + 1}
										</div>
									)}
								</motion.div>
								{shot && (
									<button
										type="button"
										onClick={() => captureShot(index)}
										disabled={busy || countdown !== null}
										className="text-xs text-white/80 underline disabled:opacity-40"
									>
										Retake
									</button>
								)}
							</div>
						);
					})}
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
						disabled={busy || countdown !== null}
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>

					{allShotsTaken ? (
						<Button
							size="lg"
							onClick={handleFinish}
							disabled={finishing}
							className="h-16 px-10 rounded-full text-lg"
							style={{ backgroundColor: primaryColor }}
						>
							{finishing ? (
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
							) : (
								<Camera className="h-5 w-5 mr-2" />
							)}
							Looks good
						</Button>
					) : (
						<Button
							size="lg"
							onClick={() => captureShot(nextSlot)}
							disabled={busy || countdown !== null || !isReady || (layout != null && autoShoot)}
							className="h-20 w-20 rounded-full"
							style={{ backgroundColor: primaryColor }}
						>
							<Camera className="h-10 w-10" />
						</Button>
					)}

					{/* Spacer to keep the shutter centered */}
					<div className="w-12" />
				</div>
				{layout && autoShoot && !allShotsTaken && (
					<p className="text-center text-sm text-white/70 mt-4">Auto-shooting…</p>
				)}
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
