"use client";

import { AlertCircle, ArrowLeft, Camera, Clapperboard, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { saveCapture, updateShotIndex } from "@/actions/sessions";
import { listPublicTemplates, resolveAssetUrls } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { useKioskCamera } from "@/hooks/use-kiosk-camera";
import { composeBoomerangFrames } from "@/lib/boomerang/compose";
import {
	BOOMERANG_FRAME_DELAY_MS,
	encodeBoomerangGif,
	recordBoomerangFrames,
	toPalindrome,
} from "@/lib/boomerang/encode";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR, PRIMARY_CTA_CLASS } from "@/lib/branding";
import { loadLayoutFonts } from "@/lib/compose";
import { cssFilterFor } from "@/lib/compose/css-filters";
import { requiredCaptureCount, slotCaptureIndices } from "@/lib/layout/captures";
import { parseLayoutJson } from "@/lib/layout/parse";
import { type BoothLayout, type FilterKind, printPixelSize } from "@/lib/layout/types";
import { writePhotoboothSession } from "@/lib/photobooth-session";
import { cn } from "@/lib/utils";

/** Pause (ms) between auto-chained shots so guests can re-pose. */
const AUTO_SHOOT_GAP_MS = 1400;
/** Grace period (ms) after the camera is ready before the first shot's
 * countdown auto-starts, so guests can settle into frame. */
const AUTO_START_DELAY_MS = 800;

/**
 * Output aspect ratio (width / height) of the legacy single-photo composite.
 * `compositePhoto` renders at `maxPhotoDimension × maxPhotoDimension·(4/3)`, so
 * the processed photo is always 3:4 regardless of the configured dimension.
 */
const SINGLE_PHOTO_ASPECT = 3 / 4;

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

/**
 * The aspect ratio (width / height) the compositor will cover-crop the NEXT
 * capture to, so the preview can frame the exact same crop (WYSIWYG).
 *
 * For a layout: find the slot that consumes the next NEW capture (`nextNewShot`
 * is 1-based) and return its output aspect — the slot's normalized size scaled
 * by the print pixel size, since the compositor draws slot i into a rect of
 * `slot.width·outW × slot.height·outH` and cover-crops the full frame into it.
 * Reuse slots (those with an explicit `captureIndex`) don't consume a new shot,
 * so they're skipped. Falls back to the first slot's aspect if none is found.
 */
function nextSlotAspect(layout: BoothLayout, nextNewShot: number): number {
	const captureIndices = slotCaptureIndices(layout);
	const { width: outW, height: outH } = printPixelSize(layout.print);

	const slotIndex = captureIndices.findIndex(
		(captureIndex, i) =>
			captureIndex === nextNewShot && layout.photoSlots[i].captureIndex === undefined,
	);
	const slot = layout.photoSlots[slotIndex] ?? layout.photoSlots[0];
	if (!slot || slot.height <= 0 || outH <= 0) return 1;
	return (slot.width * outW) / (slot.height * outH);
}

/**
 * Resolve a layout's background-image + graphic-layer storage keys to readable
 * URLs and return a lookup the boomerang compositor can call per asset. Layouts
 * with no assets skip the round-trip entirely.
 */
async function buildBoomerangAssetResolver(
	eventId: string,
	layout: BoothLayout,
): Promise<(src: string) => string> {
	const assetKeys: string[] = [];
	if (layout.background.type === "image" && layout.background.src) {
		assetKeys.push(layout.background.src);
	}
	for (const graphic of layout.graphicLayers) {
		if (graphic.src) assetKeys.push(graphic.src);
	}
	const urls = assetKeys.length > 0 ? await resolveAssetUrls(eventId, assetKeys) : {};
	return (src: string) => urls[src] ?? src;
}

/** Read a Blob as a base64 `data:` URL, so the encoded GIF can ride through
 * sessionStorage to the result screen without a server round-trip. */
function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
		reader.readAsDataURL(blob);
	});
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
	// Boomerang mode records a burst → GIF instead of N still frames. Everything
	// else (shared camera, framed preview, auto-start + countdown, auto-advance to
	// the result) is shared with the photo-strip path.
	const isBoomerang = searchParams.get("mode") === "boomerang";
	const t = useTranslations("kiosk.capture");
	const tBoomerang = useTranslations("kiosk.boomerang");
	const tCommon = useTranslations("kiosk.common");
	const tLoading = useTranslations("kiosk.loading");

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
	// Number of DISTINCT captures to take: slots that reuse an earlier capture
	// (captureIndex) don't add a shot, so this can be fewer than photoSlots.length.
	const shotTotal = layout ? requiredCaptureCount(layout) : 1;
	// The preview filter is the template/guest filter (overrides only matter at compose time).
	const previewFilter: FilterKind = layout ? filter : "none";

	// One shared kiosk stream for the whole session — the same stream the select
	// screen used, so getUserMedia is not called again here.
	const { stream, error, mirror, retry } = useKioskCamera(event ?? undefined);
	// Digital zoom (center crop) applied identically to the live preview and the
	// captured frame, so guests don't have to stand far back. 1 = no zoom.
	const zoom = Math.max(1, event?.captureZoom ?? 1);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// True once the shared stream is attached to <video> AND the element has real
	// frame dimensions, so capture() can read pixels and auto-start can fire.
	const [videoReady, setVideoReady] = useState(false);

	const [shots, setShots] = useState<string[]>([]);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [flash, setFlash] = useState(false);
	const [busy, setBusy] = useState(false);
	const [captureError, setCaptureError] = useState<string | null>(null);
	const [finishing, setFinishing] = useState(false);
	const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Boomerang-only progress: the burst record (0..1) drives the recording ring;
	// `recording`/`encoding` drive the overlays during the single capture. The
	// strip path never sets these.
	const [recordProgress, setRecordProgress] = useState(0);
	const [recording, setRecording] = useState(false);
	const [encoding, setEncoding] = useState(false);

	// Preload the template's fonts for the boomerang compositor, so the per-frame
	// text layers draw in the right faces. Cheap + cached; strips load fonts at
	// compose time on the result screen instead.
	useEffect(() => {
		if (isBoomerang && layout) void loadLayoutFonts(layout);
	}, [isBoomerang, layout]);

	// Bind the shared stream to the <video> element and track readiness. Mirrors
	// useCamera's behavior (srcObject + play() ignoring the benign AbortError) but
	// without owning the stream — the shared module does that.
	useEffect(() => {
		const video = videoRef.current;
		if (!video || !stream) {
			setVideoReady(false);
			return;
		}

		if (video.srcObject !== stream) {
			video.srcObject = stream;
		}

		const markReady = () => {
			if (video.videoWidth > 0 && video.videoHeight > 0) {
				setVideoReady(true);
			}
		};

		video.addEventListener("loadedmetadata", markReady);
		video.addEventListener("playing", markReady);
		// Already have frames (stream reused from a prior screen): mark immediately.
		markReady();

		void video.play().catch((err: unknown) => {
			// play() commonly rejects with AbortError when a re-render re-attaches the
			// stream mid-play; the stream is wired up regardless, so it is safe to
			// ignore. Surface only real errors.
			if (err instanceof Error && err.name !== "AbortError") {
				console.error("Capture preview playback failed:", err);
			}
		});

		return () => {
			video.removeEventListener("loadedmetadata", markReady);
			video.removeEventListener("playing", markReady);
		};
	}, [stream]);

	const isReady = videoReady && error === null;

	// Clear any pending timers on unmount to avoid setting state after teardown.
	useEffect(() => {
		return () => {
			if (flashTimerRef.current) {
				clearTimeout(flashTimerRef.current);
			}
		};
	}, []);

	/** Grab the current video frame and return it as a JPEG data URL. Bakes in the
	 * same digital zoom (center crop) and mirror the live preview shows, so what
	 * the guest saw is exactly what's saved; the compositor then cover-crops each
	 * slot from this frame (the preview box previews that crop). */
	const capture = useCallback((): string | null => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || !videoReady) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		// Keep the output at full sensor resolution; zoom is a center crop scaled
		// back up to fill the canvas (matching the preview's CSS scale).
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const srcWidth = video.videoWidth / zoom;
		const srcHeight = video.videoHeight / zoom;
		const srcX = (video.videoWidth - srcWidth) / 2;
		const srcY = (video.videoHeight - srcHeight) / 2;

		ctx.save();
		if (mirror) {
			// Flip horizontally so the saved frame matches the mirrored preview.
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}
		ctx.drawImage(video, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);
		ctx.restore();

		return canvas.toDataURL("image/jpeg", 0.95);
	}, [videoReady, mirror, zoom]);

	/** Run the animated countdown, then flash + grab a frame. Returns the dataURL. */
	const runCountdownAndCapture = useCallback(async (): Promise<string | null> => {
		const seconds = event?.captureDefaultCountdown ?? 3;
		for (let n = seconds; n > 0; n--) {
			setCountdown(n);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		setCountdown(null);
		setFlash(true);
		if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
		flashTimerRef.current = setTimeout(() => setFlash(false), 220);
		return capture();
	}, [event?.captureDefaultCountdown, capture]);

	/** Persist shots locally. sessionStorage is the source of truth; the result
	 * page composes from it. We deliberately do NOT ship the raw data-URL shots
	 * to a server action — each shot is 1–2 MB and would blow past Next.js's
	 * server-action body limit. */
	const persist = useCallback(
		(next: string[]) => {
			if (!sessionId) return;
			if (layout) {
				writePhotoboothSession(sessionId, { shots: next, filter });
			}
		},
		[sessionId, layout, filter],
	);

	const goToResult = useCallback(() => {
		if (!sessionId) return;
		const query = new URLSearchParams({ session: sessionId });
		if (templateId) query.set("template", templateId);
		query.set("filter", filter);
		if (isBoomerang) query.set("mode", "boomerang");
		router.push(`/kiosk/${orgSlug}/${eventSlug}/result?${query.toString()}`);
	}, [sessionId, templateId, filter, isBoomerang, router, orgSlug, eventSlug]);

	/**
	 * Boomerang capture: run the SAME countdown, then record a burst from the
	 * bound <video> instead of grabbing a single still. The frames are made into a
	 * seamless palindrome, decorated with the chosen template + filter (when a
	 * layout was picked), encoded to a GIF, stashed in the session, and the screen
	 * auto-advances to the result — no filmstrip, no retake, no preview/redo.
	 */
	const recordBoomerang = useCallback(async () => {
		if (!event || !sessionId || !videoRef.current || !isReady) return;
		if (busy || countdown !== null) return;
		setBusy(true);
		setCaptureError(null);
		setRecordProgress(0);

		// Animated countdown, identical to the still path.
		const seconds = event.captureDefaultCountdown ?? 3;
		for (let n = seconds; n > 0; n--) {
			setCountdown(n);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		setCountdown(null);

		try {
			setRecording(true);
			const frames = await recordBoomerangFrames({
				video: videoRef.current,
				mirrored: mirror,
				zoom,
				onProgress: setRecordProgress,
			});
			setRecording(false);

			setEncoding(true);
			// Palindrome (forward + reverse) so the loop bounces seamlessly. When a
			// template was chosen we decorate every frame with it (background + frame
			// graphics + text, baked AROUND the clip) and bake in the chosen filter;
			// otherwise we encode the plain frames.
			const looped = toPalindrome(frames);
			const decorated = layout
				? await composeBoomerangFrames({
						frames: looped,
						layout,
						filter,
						tokens: {
							coupleNames: event.coupleNames ?? event.name,
							date: event.startDate
								? new Date(event.startDate).toLocaleDateString(undefined, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								: undefined,
							eventName: event.name,
						},
						resolveAssetUrl: await buildBoomerangAssetResolver(event.id, layout),
					})
				: looped;

			const blob = await encodeBoomerangGif(decorated, { frameDelayMs: BOOMERANG_FRAME_DELAY_MS });
			const { width, height } = decorated[0];

			// Stash the encoded GIF in the session (the result screen uploads it).
			const gifDataUrl = await blobToDataUrl(blob);
			writePhotoboothSession(sessionId, {
				shots: [],
				filter,
				boomerangGif: gifDataUrl,
				boomerangWidth: width,
				boomerangHeight: height,
			});

			goToResult();
		} catch (err) {
			console.error("Boomerang capture failed:", err);
			setRecording(false);
			setEncoding(false);
			setBusy(false);
			setCaptureError(tBoomerang("captureFailed"));
		}
	}, [
		event,
		sessionId,
		isReady,
		busy,
		countdown,
		mirror,
		zoom,
		layout,
		filter,
		goToResult,
		tBoomerang,
	]);

	// Single-photo path: persist the frame, then go straight to the result. The
	// personalize step (guest caption + mirror toggle) was removed; mirroring is
	// now an admin setting (event.mirrorPhotos) applied at compose time.
	const finishSingle = useCallback(
		async (dataUrl: string) => {
			if (!sessionId) return;
			await saveCapture(sessionId, dataUrl);
			goToResult();
		},
		[sessionId, goToResult],
	);

	/** Capture a single shot for slot `index`, replacing it on a retake. */
	const captureShot = useCallback(
		async (index: number) => {
			if (busy || countdown !== null || !isReady) return;
			setBusy(true);
			setCaptureError(null);
			try {
				const dataUrl = await runCountdownAndCapture();
				if (!dataUrl) throw new Error(t("couldNotReadFrame"));

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
				setCaptureError(t("captureFailed"));
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
			t,
		],
	);

	// Keep a stable reference to the latest captureShot so the auto-shoot effect
	// doesn't tear down/re-run (and risk double-firing) whenever captureShot's
	// closure changes (shots/busy/etc.).
	const captureRef = useRef(captureShot);
	useEffect(() => {
		captureRef.current = captureShot;
	}, [captureShot]);

	const filledCount = shots.filter(Boolean).length;
	const allShotsTaken = layout != null && filledCount >= shotTotal;

	// Auto-shoot: chain the remaining shots automatically with a short pause.
	const autoShoot = event?.captureAutoShoot ?? false;
	const autoRunningRef = useRef(false);
	useEffect(() => {
		if (isBoomerang) return; // Boomerang is one capture; never chains shots.
		if (!layout || !autoShoot || !isReady) return;
		if (autoRunningRef.current) return;
		if (busy || countdown !== null) return;
		if (filledCount >= shotTotal) return;

		autoRunningRef.current = true;
		const nextIndex = filledCount;
		const timer = setTimeout(() => {
			void captureRef.current(nextIndex).finally(() => {
				autoRunningRef.current = false;
			});
		}, AUTO_SHOOT_GAP_MS);

		return () => {
			clearTimeout(timer);
			autoRunningRef.current = false;
		};
	}, [isBoomerang, layout, autoShoot, isReady, busy, countdown, filledCount, shotTotal]);

	// Auto-start: begin the opening shot's countdown automatically once the camera
	// is ready, so guests don't have to tap the shutter to get going. Fires once,
	// only for the first shot; autoShoot already drives every shot when enabled, so
	// this stays out of its way.
	const autoStart = event?.captureAutoStart ?? true;
	const autoStartedRef = useRef(false);
	useEffect(() => {
		if (isBoomerang) return; // Boomerang has its own single-capture auto-start below.
		if (!autoStart || autoShoot || !isReady) return;
		if (autoStartedRef.current) return;
		if (busy || countdown !== null || filledCount > 0) return;

		autoStartedRef.current = true;
		const timer = setTimeout(() => {
			void captureRef.current(0);
		}, AUTO_START_DELAY_MS);

		return () => clearTimeout(timer);
	}, [isBoomerang, autoStart, autoShoot, isReady, busy, countdown, filledCount]);

	// Boomerang auto-start: once the camera is ready, kick off the single burst
	// recording automatically (governed by the same captureAutoStart setting).
	// Fires once via a stable ref so a re-render mid-record can't double-trigger;
	// a manual tap of the record button covers the auto-start-off case.
	const recordBoomerangRef = useRef(recordBoomerang);
	useEffect(() => {
		recordBoomerangRef.current = recordBoomerang;
	}, [recordBoomerang]);
	const boomerangStartedRef = useRef(false);
	useEffect(() => {
		if (!isBoomerang || !autoStart || !isReady) return;
		if (boomerangStartedRef.current) return;
		if (busy || countdown !== null) return;

		boomerangStartedRef.current = true;
		const timer = setTimeout(() => {
			void recordBoomerangRef.current();
		}, AUTO_START_DELAY_MS);

		return () => clearTimeout(timer);
	}, [isBoomerang, autoStart, isReady, busy, countdown]);

	const handleFinish = useCallback(() => {
		setFinishing(true);
		goToResult();
	}, [goToResult]);

	// Auto-advance: once every shot is captured, go straight to the result screen
	// instead of waiting on a "looks good" confirmation. Keeps the booth fast so
	// guests can quickly take the next photo; a redo is a fresh capture.
	const finishedRef = useRef(false);
	useEffect(() => {
		if (!layout || !allShotsTaken || finishedRef.current) return;
		finishedRef.current = true;
		handleFinish();
	}, [layout, allShotsTaken, handleFinish]);

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

	const primaryColor = event.primaryColor || DEFAULT_BRAND_COLOR;
	const accentColor = event.accentColor || primaryColor;
	const nextSlot = filledCount;
	// Combine mirror (horizontal flip) and zoom (uniform scale) into one transform
	// so the framed preview matches the captured frame 1:1.
	const previewTransform = `scale(${mirror ? -zoom : zoom}, ${zoom})`;
	// WYSIWYG: frame the live feed to the exact aspect the compositor will
	// cover-crop the next capture to. For a layout this is the next slot's output
	// aspect; for single-photo it's the fixed composite aspect. The <video> uses
	// object-cover + the same mirror, so the box previews the processed crop 1:1.
	const previewAspect = layout ? nextSlotAspect(layout, nextSlot + 1) : SINGLE_PHOTO_ASPECT;

	return (
		<div className="h-[100svh] bg-black text-white relative overflow-hidden">
			{/* Dimmed backdrop outside the framed preview box, so the area that WON'T
			    be captured reads as out-of-frame. */}
			<div className="absolute inset-0 bg-black" />

			{/* WYSIWYG camera view: centered box whose aspect matches the processed
			    photo's crop. The <video> cover-fills this box with the same mirror,
			    so what the guest sees is exactly what gets composited. The box fits
			    inside the screen (letterboxed against the dimmed backdrop) while
			    keeping `previewAspect` exactly: both max constraints + aspect-ratio
			    let the browser shrink whichever dimension is binding. */}
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div
					className="relative max-h-full max-w-full overflow-hidden rounded-lg"
					style={{ aspectRatio: `${previewAspect}`, height: "100%", width: "auto" }}
				>
					{/* The filter lives on this wrapper, NOT on the <video>: iOS Safari
					    gives a transformed <video> its own GPU layer and drops a CSS
					    filter applied to it, so the filtered preview never showed on
					    iPad. Filtering an ancestor (with no transform of its own) forces
					    the video to composite into the filtered pass. The transform
					    (mirror + zoom) stays on the <video>. */}
					<div className="h-full w-full" style={{ filter: cssFilterFor(previewFilter) }}>
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className="h-full w-full object-cover"
							style={{ transform: previewTransform }}
						/>
					</div>
				</div>
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

			{/* Prompt / progress — strip path */}
			{layout && !isBoomerang && (
				<div className="absolute top-0 inset-x-0 p-6 z-30 flex justify-center">
					<motion.div
						key={`${filledCount}-${countdown}`}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-5 py-2 rounded-full bg-black/40 backdrop-blur text-lg font-semibold"
					>
						{allShotsTaken
							? t("allShotsCaptured")
							: countdown !== null
								? t("pose")
								: t("shotProgress", { current: nextSlot + 1, total: shotTotal })}
					</motion.div>
				</div>
			)}

			{/* Prompt — boomerang path */}
			{isBoomerang && (
				<div className="absolute top-0 inset-x-0 p-6 z-30 flex justify-center">
					<motion.div
						key={recording ? "recording" : encoding ? "encoding" : "ready"}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-5 py-2 rounded-full bg-black/40 backdrop-blur text-lg font-semibold"
					>
						{recording
							? tBoomerang("recording")
							: encoding
								? tBoomerang("processing")
								: countdown !== null
									? t("pose")
									: tBoomerang("ready")}
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
						<span
							className="text-[200px] font-bold drop-shadow-lg leading-none"
							style={{ color: accentColor }}
						>
							{countdown}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Recording ring — boomerang burst progress */}
			<AnimatePresence>
				{isBoomerang && recording && (
					<motion.div
						className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
							<title>{tBoomerang("recording")}</title>
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

			{/* Processing overlay — boomerang GIF encode */}
			{isBoomerang && encoding && (
				<div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70">
					<Loader2 className="h-16 w-16 animate-spin mb-4" style={{ color: primaryColor }} />
					<p className="text-xl">{tBoomerang("processing")}</p>
				</div>
			)}

			{/* Filmstrip of captured thumbnails with retake — strip path only */}
			{layout && !isBoomerang && (
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
											alt={t("shotAlt", { index: index + 1 })}
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
										className="rounded px-2 py-1 text-sm text-white/90 underline transition-colors hover:text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
									>
										{t("retake")}
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
						aria-label={tCommon("back")}
						onClick={() =>
							router.push(`/kiosk/${orgSlug}/${eventSlug}/select?session=${sessionId}`)
						}
						className="text-white"
						disabled={busy || countdown !== null}
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>

					{isBoomerang ? (
						<Button
							size="lg"
							aria-label={tBoomerang("recordBoomerang")}
							onClick={() => void recordBoomerang()}
							disabled={busy || countdown !== null || !isReady}
							className={cn("h-20 w-20 rounded-full", BRANDED_CTA_FEEDBACK)}
							style={{ backgroundColor: primaryColor }}
						>
							<Clapperboard className="h-10 w-10" />
						</Button>
					) : allShotsTaken ? (
						<Button
							size="xl"
							onClick={handleFinish}
							disabled={finishing}
							className={cn(PRIMARY_CTA_CLASS, BRANDED_CTA_FEEDBACK)}
							style={{ backgroundColor: primaryColor }}
						>
							{finishing ? (
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
							) : (
								<Camera className="h-5 w-5 mr-2" />
							)}
							{t("looksGood")}
						</Button>
					) : (
						<Button
							size="lg"
							aria-label={t("takePhoto")}
							onClick={() => captureShot(nextSlot)}
							disabled={busy || countdown !== null || !isReady || (layout != null && autoShoot)}
							className={cn("h-20 w-20 rounded-full", BRANDED_CTA_FEEDBACK)}
							style={{ backgroundColor: primaryColor }}
						>
							<Camera className="h-10 w-10" />
						</Button>
					)}

					{/* Spacer to keep the shutter centered */}
					<div className="w-12" />
				</div>
				{!isBoomerang && layout && autoShoot && !allShotsTaken && (
					<p className="text-center text-sm text-white/70 mt-4">{t("autoShooting")}</p>
				)}
			</div>

			{/* Camera Starting Overlay — shown while getUserMedia is initializing (or
			    hanging on a flaky webcam) so the guest isn't left staring at a black
			    screen with a dead shutter. Sits below the controls (z-30) so the Back
			    button stays reachable if the camera never comes up; the error overlay
			    below (z-40) takes precedence once getUserMedia rejects. */}
			{!isReady && !error && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-8">
					<Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: accentColor }} />
					<p className="text-white/70 text-lg">{tCommon("startingCamera")}</p>
				</div>
			)}

			{/* Camera Error Overlay */}
			{error && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">{t("cameraErrorTitle")}</h2>
					<p className="text-white/60 mb-8 text-center">{error}</p>
					<Button
						size="lg"
						onClick={() => retry()}
						className={BRANDED_CTA_FEEDBACK}
						style={{ backgroundColor: primaryColor }}
					>
						<RotateCcw className="h-5 w-5 mr-2" />
						{tCommon("tryAgain")}
					</Button>
				</div>
			)}

			{/* Capture Error Overlay */}
			{captureError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-8">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-2xl font-bold mb-2">{t("captureFailedTitle")}</h2>
					<p className="text-white/60 mb-8 text-center">{captureError}</p>
					<Button
						size="lg"
						onClick={() => setCaptureError(null)}
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
