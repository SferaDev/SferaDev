"use client";

import { useMutation, useQuery } from "convex/react";
import { Camera, Check, Download, Loader2, Printer, RotateCcw } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { compositePhoto, downloadBlob, printImage } from "@/lib/canvas-utils";

export default function KioskResultPage() {
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

	const session = useQuery(api.sessions.get, sessionId ? { sessionId } : "skip");

	const template = useQuery(api.templates.get, templateId ? { templateId } : "skip");

	const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
	const createPhoto = useMutation(api.photos.create);
	const completeSession = useMutation(api.sessions.complete);

	const [isProcessing, setIsProcessing] = useState(true);
	const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [_shareUrl, setShareUrl] = useState<string | null>(null);
	const [humanCode, setHumanCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Auto-return to attract screen after idle
	useIdleTimeout({
		timeout: event?.idleTimeoutSeconds ?? 120,
		onIdle: () => router.push(`/kiosk/${orgSlug}/${eventSlug}`),
		enabled: !!event,
	});

	// Process and upload photo
	const processPhoto = useCallback(async () => {
		if (!event || !session?.capturedImageUrl || isProcessing === false) return;

		try {
			// Composite the photo with template
			const blob = await compositePhoto({
				photo: session.capturedImageUrl,
				template: template?.url
					? {
							url: template.url,
							safeArea: template.safeArea,
						}
					: undefined,
				caption:
					session.caption && template?.captionPosition
						? {
								text: session.caption,
								position: template.captionPosition,
							}
						: undefined,
				mirrored: session.mirrored ?? false,
				quality: event.photoQuality,
				outputWidth: event.maxPhotoDimension,
				outputHeight: Math.round(event.maxPhotoDimension * (4 / 3)),
			});

			// Create object URL for preview
			const previewUrl = URL.createObjectURL(blob);
			setFinalImageUrl(previewUrl);

			// Upload to storage
			const uploadUrl = await generateUploadUrl({
				eventId: event.id as Id<"events">,
			});

			const uploadResponse = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": blob.type },
				body: blob,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload photo");
			}

			const { storageId } = await uploadResponse.json();

			// Create photo record
			const result = await createPhoto({
				eventId: event.id as Id<"events">,
				sessionId: sessionId as Id<"sessions">,
				storageId,
				caption: session.caption,
				templateId: templateId as Id<"templates"> | undefined,
				width: event.maxPhotoDimension,
				height: Math.round(event.maxPhotoDimension * (4 / 3)),
				sizeBytes: blob.size,
			});

			// Complete session
			await completeSession({ sessionId: sessionId as Id<"sessions"> });

			// Generate share URL and QR code
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

			setIsProcessing(false);
		} catch (err) {
			console.error("Failed to process photo:", err);
			setError("Failed to process your photo. Please try again.");
			setIsProcessing(false);
		}
	}, [
		event,
		session,
		template,
		templateId,
		sessionId,
		generateUploadUrl,
		createPhoto,
		completeSession,
		isProcessing,
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

	if (event === undefined || session === undefined) {
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

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
					<p className="text-white/60 mb-8">{error}</p>
					<Button onClick={handleNewPhoto} style={{ backgroundColor: primaryColor }}>
						<RotateCcw className="h-5 w-5 mr-2" />
						Try Again
					</Button>
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
							<div className="aspect-3/4 bg-muted rounded-lg overflow-hidden">
								{finalImageUrl && (
									<img
										src={finalImageUrl}
										alt="Final result"
										className="w-full h-full object-cover"
									/>
								)}
							</div>

							{/* Actions and QR */}
							<div className="flex flex-col justify-center space-y-6">
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
