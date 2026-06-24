"use client";

import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { createPhoto, generatePhotoUploadUrl } from "@/actions/photos";
import { completeSession, getKioskSession } from "@/actions/sessions";
import { listPublicTemplates, resolveAssetUrls } from "@/actions/templates";
import { KioskResultScreen } from "@/components/kiosk-result-screen";
import { Button } from "@/components/ui/button";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { usePrintSync } from "@/hooks/use-print-sync";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { compositePhoto } from "@/lib/canvas-utils";
import { composeStrip, loadLayoutFonts, tileStripTwoUp } from "@/lib/compose";
import { parseCapturedImageUrls } from "@/lib/db/schema";
import { parseLayoutJson } from "@/lib/layout/parse";
import type { FilterKind, Orientation, PaperSize } from "@/lib/layout/types";
import { printPixelSize } from "@/lib/layout/types";
import { enqueuePhoto } from "@/lib/offline-queue";
import { clearPhotoboothSession, readPhotoboothSession } from "@/lib/photobooth-session";
import { resolveBridgeUrl } from "@/lib/print/bridge-client";
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

export default function KioskResultPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const templateId = searchParams.get("template");
	const filterParam = searchParams.get("filter");
	const t = useTranslations("kiosk.result");
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
	// Guards a single auto-print per composed photo.
	const autoPrintDoneRef = useRef(false);

	// Guards against processPhoto running twice (it is in the effect deps and
	// isProcessing stays true for the whole async run), which would otherwise
	// cause a double upload + double createPhoto + double completeSession.
	const processingStartedRef = useRef(false);

	// Drains the offline outbox when connectivity returns.
	const { sync } = useOfflineSync();

	// Print configuration resolved from the event (null until the event loads).
	const printConfig: EventPrintConfig | null = event
		? {
				printMethod: (event.printMethod as PrintMethod | null) ?? "none",
				// Blank bridge URL → fall back to the bridge's advertised mDNS hostname.
				printBridgeUrl: resolveBridgeUrl(event.printBridgeUrl),
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

	// Drains the print outbox when the bridge becomes reachable again. Only run
	// when bridge printing is configured; the URL falls back to the mDNS default
	// so a blank operator setting still reaches a LAN bridge.
	usePrintSync(printMethod === "bridge" ? resolveBridgeUrl(event?.printBridgeUrl) : null);

	// Auto-return to attract screen after idle. Stays disabled while the photo is
	// still compositing/uploading: that phase shows a spinner with no touch input,
	// so on a slow device a large strip could otherwise hit the idle timeout
	// (min 30s) and redirect mid-process before the guest ever sees the result.
	useIdleTimeout({
		timeout: event?.idleTimeoutSeconds ?? 120,
		onIdle: () => router.push(`/kiosk/${orgSlug}/${eventSlug}`),
		enabled: !!event && !isProcessing,
	});

	/** Compose a multi-shot strip from the captured shots into a JPEG blob. */
	const composeStripBlob = useCallback(async (): Promise<{
		blob: Blob;
		width: number;
		height: number;
		shots: string[];
	} | null> => {
		if (!event || !layout || !sessionId) return null;

		// Source of truth is sessionStorage; fall back to the server-stored URLs.
		const stored = readPhotoboothSession(sessionId);
		const shots =
			stored && stored.shots.length > 0
				? stored.shots
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

		const result = await composeStrip({
			layout: composeLayout,
			photos: shots,
			tokens: {
				coupleNames: event.coupleNames ?? event.name,
				date,
				eventName: event.name,
			},
			targetWidth: printPixelSize(layout.print).width,
			targetHeight: printPixelSize(layout.print).height,
			quality: event.photoQuality,
			resolveAssetUrl: (key) => assetUrls[key] ?? key,
		});

		return { blob: result.blob, width: result.width, height: result.height, shots };
	}, [event, layout, sessionId, session?.capturedImageUrls, filterParam]);

	/** Legacy single-photo composite (templates without a layout). */
	const composeSingleBlob = useCallback(async (): Promise<{
		blob: Blob;
		width: number;
		height: number;
	} | null> => {
		if (!event || !session?.capturedImageUrl) return null;

		const outputWidth = event.maxPhotoDimension;
		const outputHeight = Math.round(event.maxPhotoDimension * (4 / 3));

		const blob = await compositePhoto({
			photo: session.capturedImageUrl,
			template: template?.url
				? { url: template.url, safeArea: template.safeArea ?? undefined }
				: undefined,
			// The guest caption step was removed; no guest-entered caption is applied.
			// Mirror (and zoom) are baked into the captured frame at capture time —
			// per the admin `mirrorPhotos` setting — so the compositor must not flip
			// again here or it would double-mirror.
			mirrored: false,
			quality: event.photoQuality,
			outputWidth,
			outputHeight,
		});

		return { blob, width: outputWidth, height: outputHeight };
	}, [event, session, template]);

	// Process and upload the final image (strip or single).
	const processPhoto = useCallback(async () => {
		if (!event || !session || !isProcessing) return;
		if (processingStartedRef.current) return;
		processingStartedRef.current = true;

		try {
			const isStrip = layout != null;
			const composed = isStrip ? await composeStripBlob() : await composeSingleBlob();

			if (!composed) {
				setError(t("photosNotFound"));
				setIsProcessing(false);
				return;
			}

			const { blob, width, height } = composed;
			const kind = isStrip ? "strip" : "single";

			// Keep the composited strip available for (auto/manual) printing.
			printBlobRef.current = { blob, width, height };

			const previewUrl = URL.createObjectURL(blob);
			setFinalImageUrl(previewUrl);

			let result: Awaited<ReturnType<typeof createPhoto>>;
			try {
				const { uploadUrl, key } = await generatePhotoUploadUrl(event.id);

				const uploaded = await fetch(uploadUrl, {
					method: "PUT",
					headers: { "Content-Type": blob.type },
					body: blob,
				});
				// fetch only rejects on network errors, so a non-2xx PUT would
				// otherwise "succeed" and leave createPhoto pointing at a failed
				// object — treat it as a failure so the offline outbox retries.
				if (!uploaded.ok) {
					throw new Error(`Upload failed with status ${uploaded.status}`);
				}

				result = await createPhoto({
					eventId: event.id,
					sessionId: sessionId!,
					storageKey: key,
					templateId: templateId ?? undefined,
					kind,
					width,
					height,
					sizeBytes: blob.size,
				});
			} catch (uploadErr) {
				// Offline / upload failure: hold the composited image in the outbox so
				// it is never lost; background sync finishes it on reconnect. The guest
				// can still download/print now.
				console.warn("Deferring photo upload to offline outbox:", uploadErr);
				await enqueuePhoto({
					id: crypto.randomUUID(),
					eventId: event.id,
					sessionId: sessionId!,
					blob,
					templateId: templateId ?? undefined,
					kind,
					selectedFilter: session.selectedFilter ?? undefined,
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
		composeStripBlob,
		composeSingleBlob,
		sessionId,
		templateId,
		sync,
		t,
	]);

	useEffect(() => {
		if (event && session && isProcessing) {
			processPhoto();
		}
	}, [event, session, isProcessing, processPhoto]);

	const handlePrint = useCallback(async () => {
		const strip = printBlobRef.current;
		if (!strip || !printConfig || printConfig.printMethod === "none") return;

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

			const result = await executePrint(printBlob, printJobConfig);
			setPrintStatus(result.status);
		} catch (err) {
			console.error("Print failed:", err);
			setPrintStatus("failed");
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
		autoPrintDoneRef.current = false;
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
	// on, the photo prints automatically and no button is shown.
	const showManualPrint =
		printMethod !== "none" && event.allowPrint && printConfig?.printAutoPrint === false;

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
		<KioskResultScreen
			mediaUrl={finalImageUrl}
			mediaAlt={t("finalResultAlt")}
			qrCodeUrl={qrCodeUrl}
			showQr={event.showQrCode}
			savedOffline={savedOffline}
			primaryColor={primaryColor}
			onNewPhoto={handleNewPhoto}
			print={
				showManualPrint ? { status: printStatus, onPrint: () => void handlePrint() } : undefined
			}
		/>
	);
}
