"use client";

import { ArrowLeft, Camera, Check, Download, Loader2, Printer, RotateCcw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { createPhoto, generatePhotoUploadUrl } from "@/actions/photos";
import { completeSession, getKioskSession } from "@/actions/sessions";
import { listPublicTemplates } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { compositePhoto, downloadBlob, printImage } from "@/lib/canvas-utils";
import { composeStrip, loadLayoutFonts } from "@/lib/compose";
import { parseCapturedImageUrls } from "@/lib/db/schema";
import { parseLayoutJson } from "@/lib/layout/parse";
import { printPixelSize } from "@/lib/layout/types";
import { enqueuePhoto } from "@/lib/offline-queue";
import { clearPhotoboothSession, readPhotoboothSession } from "@/lib/photobooth-session";

/** ServiceWorkerRegistration with the optional Background Sync extension. */
interface SyncCapableRegistration extends ServiceWorkerRegistration {
	sync?: { register(tag: string): Promise<void> };
}

export default function KioskResultPage() {
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
	const [_shareUrl, setShareUrl] = useState<string | null>(null);
	const [humanCode, setHumanCode] = useState<string | null>(null);
	const [savedOffline, setSavedOffline] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Drains the offline outbox when connectivity returns.
	const { sync } = useOfflineSync();

	// Auto-return to attract screen after idle
	useIdleTimeout({
		timeout: event?.idleTimeoutSeconds ?? 120,
		onIdle: () => router.push(`/kiosk/${orgSlug}/${eventSlug}`),
		enabled: !!event,
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

		await loadLayoutFonts(layout);

		const date = event.startDate
			? new Date(event.startDate).toLocaleDateString(undefined, {
					year: "numeric",
					month: "long",
					day: "numeric",
				})
			: undefined;

		const result = await composeStrip({
			layout,
			photos: shots,
			tokens: {
				coupleNames: event.coupleNames ?? event.name,
				date,
				eventName: event.name,
			},
			targetWidth: printPixelSize(layout.print).width,
			quality: event.photoQuality,
		});

		return { blob: result.blob, width: result.width, height: result.height, shots };
	}, [event, layout, sessionId, session?.capturedImageUrls]);

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
			caption:
				session.caption && template?.captionPosition
					? { text: session.caption, position: template.captionPosition }
					: undefined,
			mirrored: session.mirrored ?? false,
			quality: event.photoQuality,
			outputWidth,
			outputHeight,
		});

		return { blob, width: outputWidth, height: outputHeight };
	}, [event, session, template]);

	// Process and upload the final image (strip or single).
	const processPhoto = useCallback(async () => {
		if (!event || !session || !isProcessing) return;

		try {
			const isStrip = layout != null;
			const composed = isStrip ? await composeStripBlob() : await composeSingleBlob();

			if (!composed) {
				setError("We couldn't find your photos. Please try again.");
				setIsProcessing(false);
				return;
			}

			const { blob, width, height } = composed;
			const rawShotsJson =
				isStrip && "shots" in composed ? JSON.stringify(composed.shots) : undefined;
			const kind = isStrip ? "strip" : "single";

			const previewUrl = URL.createObjectURL(blob);
			setFinalImageUrl(previewUrl);

			try {
				const { uploadUrl, key } = await generatePhotoUploadUrl(event.id);

				await fetch(uploadUrl, {
					method: "PUT",
					headers: { "Content-Type": blob.type },
					body: blob,
				});

				const result = await createPhoto({
					eventId: event.id,
					sessionId: sessionId!,
					storageKey: key,
					caption: session.caption ?? undefined,
					templateId: templateId ?? undefined,
					kind,
					rawShotsJson,
					width,
					height,
					sizeBytes: blob.size,
				});

				await completeSession(sessionId!);
				if (isStrip) clearPhotoboothSession(sessionId!);

				const shareBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
				const shareLink = `${shareBaseUrl}/share/${result.shareToken}`;
				setShareUrl(shareLink);
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
				// Offline / upload failure: hold the composited image in the outbox so
				// it is never lost; background sync finishes it on reconnect. The guest
				// can still download/print now.
				console.warn("Deferring photo upload to offline outbox:", uploadErr);
				await enqueuePhoto({
					id: crypto.randomUUID(),
					eventId: event.id,
					sessionId: sessionId!,
					blob,
					caption: session.caption ?? undefined,
					templateId: templateId ?? undefined,
					kind,
					rawShotsJson,
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
			}

			setIsProcessing(false);
		} catch (err) {
			console.error("Failed to process photo:", err);
			setError("Failed to process your photo. Please try again.");
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
	]);

	useEffect(() => {
		if (event && session && isProcessing) {
			processPhoto();
		}
	}, [event, session, isProcessing, processPhoto]);

	const handleDownload = () => {
		if (finalImageUrl) {
			fetch(finalImageUrl)
				.then((res) => res.blob())
				.then((blob) => {
					downloadBlob(blob, `photocall-${humanCode || "photo"}.jpg`);
				});
		}
	};

	const handlePrint = () => {
		if (finalImageUrl) {
			printImage(finalImageUrl);
		}
	};

	const handleNewPhoto = () => {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
	};

	const handleRetry = () => {
		setError(null);
		setFinalImageUrl(null);
		setQrCodeUrl(null);
		setShareUrl(null);
		setHumanCode(null);
		setIsProcessing(true);
	};

	if (eventLoading || sessionLoading) {
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

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
					<p className="text-white/60 mb-8">{error}</p>
					<div className="flex flex-col gap-3">
						<Button size="lg" onClick={handleRetry} style={{ backgroundColor: primaryColor }}>
							<RotateCcw className="h-5 w-5 mr-2" />
							Retry
						</Button>
						<Button
							size="lg"
							variant="outline"
							onClick={handleNewPhoto}
							className="border-white/20 text-white hover:bg-white/10"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							Start Over
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<div className="max-w-4xl mx-auto">
				{isProcessing ? (
					<div className="flex flex-col items-center justify-center min-h-[80vh]">
						<Loader2 className="h-16 w-16 animate-spin mb-4" />
						<p className="text-xl">Processing your photo...</p>
					</div>
				) : (
					<>
						<div className="text-center mb-8">
							<div className="inline-flex items-center gap-2 bg-green-600 px-4 py-2 rounded-full mb-4">
								<Check className="h-5 w-5" />
								<span className="font-medium">Photo saved!</span>
							</div>
							<h1 className="text-3xl font-bold">
								{event.thankYouMessage || "Thanks for taking a photo!"}
							</h1>
						</div>

						<div className="grid md:grid-cols-2 gap-8">
							{/* Photo Preview */}
							<div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center">
								{finalImageUrl && (
									<img
										src={finalImageUrl}
										alt="Final result"
										className="w-full h-full object-contain max-h-[70vh]"
									/>
								)}
							</div>

							{/* Actions and QR */}
							<div className="flex flex-col justify-center space-y-6">
								{/* Offline notice — photo is queued and will upload on reconnect */}
								{savedOffline && (
									<div className="text-center p-4 bg-amber-500/15 border border-amber-500/30 rounded-lg">
										<p className="text-sm font-medium text-amber-200">Saved on this device</p>
										<p className="text-sm text-white/60 mt-1">
											You're offline right now. Your photo will upload automatically and a shareable
											link will be ready once the connection returns. You can still download or
											print it below.
										</p>
									</div>
								)}

								{/* Human code */}
								{humanCode && (
									<div className="text-center p-4 bg-white/10 rounded-lg">
										<p className="text-sm text-white/60 mb-1">Your photo code</p>
										<p className="text-3xl font-mono font-bold tracking-wider">{humanCode}</p>
									</div>
								)}

								{/* QR Code */}
								{event.showQrCode && qrCodeUrl && (
									<div className="flex flex-col items-center p-6 bg-white rounded-lg">
										<img src={qrCodeUrl} alt="Scan to view and download" className="w-40 h-40" />
										<p className="text-black text-sm mt-2">Scan to view and download</p>
									</div>
								)}

								{/* Action buttons */}
								<div className="grid grid-cols-2 gap-4">
									{event.allowDownload && (
										<Button
											size="lg"
											variant="outline"
											onClick={handleDownload}
											className="border-white/20 text-white hover:bg-white/10"
										>
											<Download className="h-5 w-5 mr-2" />
											Download
										</Button>
									)}
									{event.allowPrint && (
										<Button
											size="lg"
											variant="outline"
											onClick={handlePrint}
											className="border-white/20 text-white hover:bg-white/10"
										>
											<Printer className="h-5 w-5 mr-2" />
											Print
										</Button>
									)}
								</div>

								<Button
									size="lg"
									onClick={handleNewPhoto}
									className="w-full"
									style={{ backgroundColor: primaryColor }}
								>
									<Camera className="h-5 w-5 mr-2" />
									Take Another Photo
								</Button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
