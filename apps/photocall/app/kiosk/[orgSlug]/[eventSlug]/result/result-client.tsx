"use client";

import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { createPhoto, generatePhotoUploadUrl, type PhotoContentType } from "@/actions/photos";
import { completeSession, getKioskSession } from "@/actions/sessions";
import { listPublicTemplates, resolveAssetUrls } from "@/actions/templates";
import { KioskResultScreen } from "@/components/kiosk-result-screen";
import { PendingPrints } from "@/components/pending-prints";
import { Button } from "@/components/ui/button";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { compositePhoto, loadImage } from "@/lib/canvas-utils";
import { composeStrip, loadLayoutFonts, tileStripTwoUp } from "@/lib/compose";
import { parseCapturedImageUrls } from "@/lib/db/schema";
import { parseLayoutJson } from "@/lib/layout/parse";
import type { FilterKind, Orientation, PaperSize } from "@/lib/layout/types";
import { printPixelSize } from "@/lib/layout/types";
import { enqueuePhoto } from "@/lib/offline-queue";
import {
	clearPhotoboothSession,
	getBoomerangBlob,
	getCaptureShots,
	readPhotoboothSession,
} from "@/lib/photobooth-session";
import { executePrint } from "@/lib/print/index";
import type { EventPrintConfig, PrintJobStatus, PrintMethod } from "@/lib/print/types";

/** ServiceWorkerRegistration with the optional Background Sync extension. */
interface SyncCapableRegistration extends ServiceWorkerRegistration {
	sync?: { register(tag: string): Promise<void> };
}

function isFilterKind(value: string | null | undefined): value is FilterKind {
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

/** A finished blob plus its pixel dimensions. */
interface CaptureBlob {
	blob: Blob;
	width: number;
	height: number;
}

/**
 * The assets produced for a capture under the "decorated main image + raw shots"
 * model:
 *  - `image`: the DECORATED composite (all graphic + text layers). It is the main
 *    image — shown as the result preview, stored as `storageKey`, used for the
 *    dashboard gallery / public share main image, AND what prints.
 *  - `rawShots`: the individual full-frame capture blobs (NOT cropped into the
 *    template), each viewable and downloadable. Empty when there is nothing to
 *    keep separately (e.g. an undecorated single capture).
 *
 * There is no separate clean/undecorated composite and no separate print image —
 * the main `image` already IS the print version.
 */
interface ComposedCapture {
	image: CaptureBlob;
	rawShots: Blob[];
}

/** Decode a data URL (or any fetchable URL) into a Blob. */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
	const response = await fetch(dataUrl);
	return response.blob();
}

/**
 * Upload one capture blob to R2 via a freshly-minted presigned PUT and return
 * its storage key. Throws on any network/HTTP failure so the caller can fall
 * back to the offline outbox with the full set of blobs.
 */
async function uploadCaptureBlob(eventId: string, blob: Blob): Promise<string> {
	const contentType: PhotoContentType = blob.type === "image/gif" ? "image/gif" : "image/jpeg";
	const { uploadUrl, key } = await generatePhotoUploadUrl(eventId, contentType);
	const uploaded = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": blob.type || contentType },
		body: blob,
	});
	// fetch only rejects on network errors, so a non-2xx PUT would otherwise
	// "succeed" and leave the record pointing at a failed object — treat it as a
	// failure so the offline outbox retries.
	if (!uploaded.ok) {
		throw new Error(`Upload failed with status ${uploaded.status}`);
	}
	return key;
}

export default function KioskResultPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const templateId = searchParams.get("template");
	const filterParam = searchParams.get("filter");
	// Boomerang results render a pre-encoded GIF (held in the session by the
	// capture screen) instead of compositing a strip/single here; boomerangs can't
	// print, so the result screen drops the print affordance for them.
	const isBoomerang = searchParams.get("mode") === "boomerang";
	const t = useTranslations("kiosk.result");
	const tBoomerang = useTranslations("kiosk.boomerang");
	const tLoading = useTranslations("kiosk.loading");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { data: session, isLoading: sessionLoading } = useSWR(
		sessionId ? ["kiosk-session", sessionId] : null,
		() => getKioskSession(sessionId!),
	);

	// Use listPublicTemplates to find the template by ID (avoids auth requirement)
	const { data: templates } = useSWR(
		event && templateId ? ["public-templates", event.id] : null,
		() => listPublicTemplates(event!.id),
	);

	const template = templates?.find((t) => t.id === templateId) ?? null;
	const layout = template ? parseLayoutJson(template.layoutJson) : null;

	const [isProcessing, setIsProcessing] = useState(true);
	const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [savedOffline, setSavedOffline] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [printStatus, setPrintStatus] = useState<PrintJobStatus>("idle");

	// Hold the composited strip (and its pixel dims, needed for 2-up tiling) so we
	// can (re)print without re-fetching it.
	const printBlobRef = useRef<{ blob: Blob; width: number; height: number } | null>(null);
	// The created photo's id, once the record exists, so a (bridge) print can be
	// associated with its photo. Null until createPhoto succeeds — auto-print may
	// fire before then, in which case the job simply carries no photoId.
	const photoIdRef = useRef<string | null>(null);
	// Guards a single auto-print per composed photo.
	const autoPrintDoneRef = useRef(false);
	// Synchronous lock against a double-tap on the print button submitting twice.
	// A ref (not state) so the SECOND tap is rejected in the same tick, before any
	// re-render — the `disabled` prop and `printStatus` update a frame too late to
	// stop a fast double-tap on a touchscreen kiosk. Mirrors processingStartedRef.
	const printingRef = useRef(false);

	// Guards against processPhoto running twice (it is in the effect deps and
	// isProcessing stays true for the whole async run), which would otherwise
	// cause a double upload + double createPhoto + double completeSession.
	const processingStartedRef = useRef(false);

	// Drains the offline outbox when connectivity returns.
	const { sync } = useOfflineSync();

	// Print configuration resolved from the event (null until the event loads).
	const printConfig: EventPrintConfig | null = event
		? {
				eventId: event.id,
				printMethod: (event.printMethod as PrintMethod | null) ?? "none",
				printPrinterId: event.printPrinterId,
				printPaperSize: (event.printPaperSize as PaperSize | null) ?? null,
				printMediaType: event.printMediaType,
				printBorderless: event.printBorderless,
				printCopies: event.printCopies,
				printOrientation: (event.printOrientation as Orientation | null) ?? "portrait",
				printAutoPrint: event.printAutoPrint,
			}
		: null;
	const printMethod = printConfig?.printMethod ?? "none";

	// Whether cloud-pull bridge printing is configured for this event. Gates the
	// print outbox drain + pending notice: the <PendingPrints> mount below both
	// drains the outbox (re-enqueuing to the server-side queue) when connectivity
	// returns and surfaces the "prints waiting" notice.
	const isBridgePrinting = printMethod === "bridge";

	// Auto-return to attract screen after idle. Stays disabled while the photo is
	// still compositing/uploading: that phase shows a spinner with no touch input,
	// so on a slow device a large strip could otherwise hit the idle timeout
	// (min 30s) and redirect mid-process before the guest ever sees the result.
	useIdleTimeout({
		timeout: event?.idleTimeoutSeconds ?? 120,
		onIdle: () => router.push(`/kiosk/${orgSlug}/${eventSlug}`),
		enabled: !!event && !isProcessing,
	});

	/**
	 * Compose a multi-shot strip. Produces the DECORATED composite (all graphic +
	 * text layers) as the main `image` — it is the preview, the stored main image
	 * and what prints. The individual raw shots (the full-frame captures, NOT
	 * cropped into the template) are returned alongside as their JPEG data URLs so
	 * the caller can upload each one individually.
	 */
	const composeStripBlobs = useCallback(async (): Promise<ComposedCapture | null> => {
		if (!event || !layout || !sessionId) return null;

		// Source of truth for the bulky frames is IndexedDB (they overflow
		// sessionStorage); the tiny session JSON (filter) still rides in
		// sessionStorage. Fall back to the server-stored URLs when nothing is
		// stored locally (e.g. a different device or a cleared cache).
		const stored = readPhotoboothSession(sessionId);
		const localShots = await getCaptureShots(sessionId);
		const shots =
			localShots && localShots.length > 0
				? localShots
				: parseCapturedImageUrls(session?.capturedImageUrls ?? null);

		if (shots.length === 0) return null;

		// The guest's chosen filter (from sessionStorage, falling back to the URL
		// param) overrides the template's default filter when it is a valid kind.
		const guestFilter: FilterKind | null = isFilterKind(stored?.filter)
			? stored.filter
			: isFilterKind(filterParam)
				? filterParam
				: null;
		const composeLayout = guestFilter ? { ...layout, filter: guestFilter } : layout;

		await loadLayoutFonts(layout);

		// Graphic/sticker layers and image backgrounds are stored as S3 storage
		// keys; resolve them to readable URLs so the compositor can draw them.
		const assetKeys: string[] = [];
		if (layout.background.type === "image" && layout.background.src) {
			assetKeys.push(layout.background.src);
		}
		for (const graphic of layout.graphicLayers) {
			if (graphic.src) assetKeys.push(graphic.src);
		}
		const assetUrls = assetKeys.length > 0 ? await resolveAssetUrls(event.id, assetKeys) : {};

		const date = event.startDate
			? new Date(event.startDate).toLocaleDateString(undefined, {
					year: "numeric",
					month: "long",
					day: "numeric",
				})
			: undefined;

		const tokens = {
			coupleNames: event.coupleNames ?? event.name,
			date,
			eventName: event.name,
		};
		const targetWidth = printPixelSize(layout.print).width;
		const targetHeight = printPixelSize(layout.print).height;
		const resolveAssetUrl = (key: string) => assetUrls[key] ?? key;

		const decorated = await composeStrip({
			layout: composeLayout,
			photos: shots,
			tokens,
			targetWidth,
			targetHeight,
			quality: event.photoQuality,
			resolveAssetUrl,
		});

		// Raw shots are JPEG data URLs (from IndexedDB, or the server fallback);
		// convert to blobs so the caller can upload each via presigned PUT (keys,
		// never base64 in actions).
		const rawShots = await Promise.all(shots.map((shot) => dataUrlToBlob(shot)));

		return {
			image: { blob: decorated.blob, width: decorated.width, height: decorated.height },
			rawShots,
		};
	}, [event, layout, sessionId, session?.capturedImageUrls, filterParam]);

	/**
	 * Legacy single-photo capture. The DECORATED template composite is the main
	 * `image` (preview + stored main + print). The raw capture (the full,
	 * uncropped frame) is kept as a single raw shot. When there is no template
	 * overlay to decorate, the raw capture itself becomes the main image and there
	 * is nothing to keep separately (`rawShots` is empty).
	 */
	const composeSingleBlobs = useCallback(async (): Promise<ComposedCapture | null> => {
		if (!event || !session?.capturedImageUrl) return null;

		const outputWidth = event.maxPhotoDimension;
		const outputHeight = Math.round(event.maxPhotoDimension * (4 / 3));

		// The raw capture, uploaded as-is. Decode it to record its natural
		// dimensions in case it becomes the main image (no template overlay).
		const rawBlob = await dataUrlToBlob(session.capturedImageUrl);
		const rawImage = await loadImage(session.capturedImageUrl);

		// No template overlay → nothing to decorate. Store the raw capture as the
		// main image and keep no separate raw shots.
		if (!template?.url) {
			return {
				image: {
					blob: rawBlob,
					width: rawImage.naturalWidth,
					height: rawImage.naturalHeight,
				},
				rawShots: [],
			};
		}

		const decoratedBlob = await compositePhoto({
			photo: session.capturedImageUrl,
			template: { url: template.url, safeArea: template.safeArea ?? undefined },
			// The guest caption step was removed; no guest-entered caption is applied.
			// Mirror (and zoom) are baked into the captured frame at capture time —
			// per the admin `mirrorPhotos` setting — so the compositor must not flip
			// again here or it would double-mirror.
			mirrored: false,
			quality: event.photoQuality,
			outputWidth,
			outputHeight,
		});

		return {
			image: { blob: decoratedBlob, width: outputWidth, height: outputHeight },
			rawShots: [rawBlob],
		};
	}, [event, session, template]);

	/**
	 * Boomerang result: the GIF was already recorded, decorated, filtered and
	 * encoded on the capture screen and stashed in the session. Here we just read
	 * it back, show it, and upload it (presigned R2 PUT of the GIF → a
	 * `kind: "boomerang"` photo record with NO printStorageKey/rawShotKeys). On an
	 * upload failure it falls into the offline outbox with the GIF blob, exactly
	 * like the old boomerang screen's share().
	 */
	const processBoomerang = useCallback(async () => {
		if (!event || !session || !sessionId || !isProcessing) return;
		if (processingStartedRef.current) return;
		processingStartedRef.current = true;

		try {
			// The GIF was stashed as a Blob in IndexedDB by the capture screen (too big
			// for sessionStorage); read it back here. Its dimensions ride in the
			// session JSON, which is tiny.
			const blob = await getBoomerangBlob(sessionId);
			if (!blob) {
				setError(t("photosNotFound"));
				setIsProcessing(false);
				return;
			}

			const stored = readPhotoboothSession(sessionId);
			const width = stored?.boomerangWidth ?? 0;
			const height = stored?.boomerangHeight ?? 0;

			// Preview the GIF immediately (the result screen renders it as-is).
			const previewUrl = URL.createObjectURL(blob);
			setFinalImageUrl(previewUrl);

			try {
				const storageKey = await uploadCaptureBlob(event.id, blob);
				const result = await createPhoto({
					eventId: event.id,
					sessionId,
					storageKey,
					kind: "boomerang",
					width,
					height,
					sizeBytes: blob.size,
				});

				try {
					await completeSession(sessionId);
				} catch (sessionErr) {
					console.warn("Failed to mark session complete:", sessionErr);
				}
				clearPhotoboothSession(sessionId);

				const shareBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
				const shareLink = `${shareBaseUrl}/share/${result.shareToken}`;
				if (event.showQrCode) {
					try {
						const qr = await QRCode.toDataURL(shareLink, {
							width: 256,
							margin: 2,
							color: { dark: "#000000", light: "#ffffff" },
						});
						setQrCodeUrl(qr);
					} catch (qrErr) {
						console.warn("QR generation failed:", qrErr);
					}
				}
			} catch (uploadErr) {
				// Offline / upload failure: hold the GIF in the outbox so it is never
				// lost; background sync finishes it on reconnect. Boomerangs have no
				// decorated/print version and no separate raw shots — pin printBlob to
				// null and rawShotBlobs to [] so the sync stores a NULL printStorageKey.
				console.warn("Deferring boomerang upload to offline outbox:", uploadErr);
				await enqueuePhoto({
					id: crypto.randomUUID(),
					eventId: event.id,
					sessionId,
					blob,
					contentType: "image/gif",
					printBlob: null,
					rawShotBlobs: [],
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

				clearPhotoboothSession(sessionId);
				setSavedOffline(true);
				void sync();
			}

			setIsProcessing(false);
		} catch (err) {
			console.error("Failed to process boomerang:", err);
			setError(t("processFailed"));
			setIsProcessing(false);
		}
	}, [event, session, sessionId, isProcessing, sync, t]);

	// Process and upload the final capture (strip or single).
	const processPhoto = useCallback(async () => {
		if (!event || !session || !isProcessing) return;
		if (processingStartedRef.current) return;
		processingStartedRef.current = true;

		try {
			const isStrip = layout != null;
			const composed = isStrip ? await composeStripBlobs() : await composeSingleBlobs();

			if (!composed) {
				setError(t("photosNotFound"));
				setIsProcessing(false);
				return;
			}

			const { image, rawShots } = composed;
			const kind = isStrip ? "strip" : "single";

			// The decorated main image is what prints. Hold it for (auto/manual)
			// printing.
			printBlobRef.current = { blob: image.blob, width: image.width, height: image.height };

			// The preview shows the decorated main image — what you see is what prints.
			const previewUrl = URL.createObjectURL(image.blob);
			setFinalImageUrl(previewUrl);

			let result: Awaited<ReturnType<typeof createPhoto>>;
			try {
				// Upload every asset via presigned PUT (one key per blob) BEFORE
				// creating the record, so a failure mid-way falls into the offline
				// outbox with the complete set rather than a half-created record. The
				// decorated main image is `storageKey`; the raw shots are `rawShotKeys`.
				// There is no separate print image — the main image already IS the print
				// version — so `printStorageKey` is omitted.
				const storageKey = await uploadCaptureBlob(event.id, image.blob);
				const rawShotKeys: string[] = [];
				for (const shot of rawShots) {
					rawShotKeys.push(await uploadCaptureBlob(event.id, shot));
				}

				result = await createPhoto({
					eventId: event.id,
					sessionId: sessionId!,
					storageKey,
					rawShotKeys: rawShotKeys.length > 0 ? JSON.stringify(rawShotKeys) : undefined,
					templateId: templateId ?? undefined,
					kind,
					width: image.width,
					height: image.height,
					sizeBytes: image.blob.size,
				});
				// Associate any (subsequent or in-flight) print with this photo.
				photoIdRef.current = result.photoId;
			} catch (uploadErr) {
				// Offline / upload failure: hold ALL blobs in the outbox so nothing is
				// lost; background sync re-uploads them and creates the record on
				// reconnect. The guest can still download/print now. The decorated main
				// image is the outbox `blob` (→ storageKey); the raw shots are
				// `rawShotBlobs` (→ rawShotKeys). No print blob — the main image is the
				// print version.
				console.warn("Deferring photo upload to offline outbox:", uploadErr);
				await enqueuePhoto({
					id: crypto.randomUUID(),
					eventId: event.id,
					sessionId: sessionId!,
					blob: image.blob,
					printBlob: null,
					rawShotBlobs: rawShots,
					templateId: templateId ?? undefined,
					kind,
					selectedFilter: session.selectedFilter ?? undefined,
					width: image.width,
					height: image.height,
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

				if (isStrip) clearPhotoboothSession(sessionId!);
				setSavedOffline(true);
				void sync();
				setIsProcessing(false);
				return;
			}

			// Upload + record succeeded. Everything below is best-effort follow-up;
			// a failure here must NOT fall into the offline outbox, or the photo
			// would be uploaded a second time (duplicate record + double metering).
			try {
				await completeSession(sessionId!);
			} catch (sessionErr) {
				console.warn("Failed to mark session complete:", sessionErr);
			}
			if (isStrip) clearPhotoboothSession(sessionId!);

			const shareBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
			const shareLink = `${shareBaseUrl}/share/${result.shareToken}`;

			if (event.showQrCode) {
				try {
					const qr = await QRCode.toDataURL(shareLink, {
						width: 256,
						margin: 2,
						color: { dark: "#000000", light: "#ffffff" },
					});
					setQrCodeUrl(qr);
				} catch (qrErr) {
					console.warn("QR generation failed:", qrErr);
				}
			}

			setIsProcessing(false);
		} catch (err) {
			console.error("Failed to process photo:", err);
			setError(t("processFailed"));
			setIsProcessing(false);
		}
	}, [
		event,
		session,
		isProcessing,
		layout,
		composeStripBlobs,
		composeSingleBlobs,
		sessionId,
		templateId,
		sync,
		t,
	]);

	useEffect(() => {
		if (!event || !session || !isProcessing) return;
		if (isBoomerang) {
			void processBoomerang();
		} else {
			void processPhoto();
		}
	}, [event, session, isProcessing, isBoomerang, processBoomerang, processPhoto]);

	const handlePrint = useCallback(async () => {
		const strip = printBlobRef.current;
		if (!strip || !printConfig || printConfig.printMethod === "none") return;
		// Reject a concurrent/double-tap submit synchronously, before any await, so
		// the same photo can't be sent to the printer twice.
		if (printingRef.current) return;
		printingRef.current = true;

		setPrintStatus("printing");
		try {
			// 2-up: duplicate a vertical strip onto a single 4×6 sheet (cut into two
			// identical strips). The tiled image IS 4×6 regardless of the event's
			// configured paper size, so override printPaperSize for this job only.
			const tileTwoUp = layout?.print.tileTwoUp === true && layout.kind === "strip_vertical";
			let printBlob = strip.blob;
			let printJobConfig = printConfig;
			if (tileTwoUp) {
				const tiled = await tileStripTwoUp(strip.blob, strip.width, strip.height, layout.print.dpi);
				printBlob = tiled.blob;
				// The tiled sheet is 4×6 LANDSCAPE (two portrait strips side by side),
				// so override both paper size and orientation for this job only — the
				// manual @page hint and the bridge both need the landscape orientation.
				printJobConfig = { ...printConfig, printPaperSize: "4x6", printOrientation: "landscape" };
			}

			const result = await executePrint(printBlob, printJobConfig, photoIdRef.current ?? undefined);
			setPrintStatus(result.status);
		} catch (err) {
			console.error("Print failed:", err);
			setPrintStatus("failed");
		} finally {
			// Release the lock so the guest can retry after a failure. A successful or
			// queued print disables the button via `printStatus`, so releasing here
			// does not re-open a duplicate submit for a print that already went out.
			printingRef.current = false;
		}
	}, [printConfig, layout]);

	// Auto-print once the photo is composed, if the event opts in.
	useEffect(() => {
		if (isProcessing || !printConfig) return;
		if (!printConfig.printAutoPrint || printConfig.printMethod === "none") return;
		if (autoPrintDoneRef.current || !printBlobRef.current) return;
		autoPrintDoneRef.current = true;
		void handlePrint();
	}, [isProcessing, printConfig, handlePrint]);

	const handleNewPhoto = () => {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
	};

	const handleRetry = () => {
		setError(null);
		setFinalImageUrl(null);
		setQrCodeUrl(null);
		processingStartedRef.current = false;
		printBlobRef.current = null;
		photoIdRef.current = null;
		autoPrintDoneRef.current = false;
		printingRef.current = false;
		setPrintStatus("idle");
		setIsProcessing(true);
	};

	if (eventLoading || sessionLoading) {
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

	// A manual "Send to printer" action is offered only when printing is
	// configured, the event allows it, and auto-print is OFF. When auto-print is
	// on, the photo prints automatically and no button is shown. Boomerangs can't
	// be printed, so they never show the affordance.
	const showManualPrint =
		!isBoomerang &&
		printMethod !== "none" &&
		event.allowPrint &&
		printConfig?.printAutoPrint === false;

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">{t("somethingWentWrong")}</h1>
					<p className="text-white/60 mb-8">{error}</p>
					<div className="flex flex-col gap-3">
						<Button
							size="lg"
							onClick={handleRetry}
							className={BRANDED_CTA_FEEDBACK}
							style={{ backgroundColor: primaryColor }}
						>
							<RotateCcw className="h-5 w-5 mr-2" />
							{t("retry")}
						</Button>
						<Button
							size="lg"
							variant="outline"
							onClick={handleNewPhoto}
							className="bg-transparent border-white/20 text-white hover:bg-white/10"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							{t("startOver")}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isProcessing) {
		return (
			<div
				className="flex min-h-screen flex-col items-center justify-center bg-black text-white"
				role="status"
				aria-label={t("processing")}
			>
				<Loader2 className="mb-4 h-16 w-16 animate-spin" style={{ color: primaryColor }} />
				<p className="text-2xl">{t("processing")}</p>
			</div>
		);
	}

	return (
		<>
			<KioskResultScreen
				mediaUrl={finalImageUrl}
				mediaAlt={isBoomerang ? tBoomerang("resultAlt") : t("finalResultAlt")}
				qrCodeUrl={qrCodeUrl}
				showQr={event.showQrCode}
				savedOffline={savedOffline}
				primaryColor={primaryColor}
				onNewPhoto={handleNewPhoto}
				print={
					showManualPrint ? { status: printStatus, onPrint: () => void handlePrint() } : undefined
				}
			/>
			{/* Persistent "prints waiting" notice (mounts the outbox drain too). Shown
			    on the result screen so the operator sees prints stacking up behind an
			    out-of-paper / offline bridge — the no-loss queue retries them forever. */}
			<PendingPrints enabled={isBridgePrinting} />
		</>
	);
}
