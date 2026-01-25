"use client";

import { useMutation, useQuery } from "convex/react";
import { Camera, Download, Loader2, Printer, QrCode, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { compositePhoto, downloadBlob, printImage } from "@/lib/canvas-utils";
import { generateQRCode } from "@/lib/qr";

function ResultPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session") as Id<"sessions"> | null;
	const templateId = searchParams.get("template") as Id<"templates"> | null;

	const session = useQuery(api.sessions.get, sessionId ? { sessionId } : "skip");
	const template = useQuery(api.templates.get, templateId ? { templateId } : "skip");
	const settings = useQuery(api.settings.get);

	const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
	const createPhoto = useMutation(api.photos.create);
	const completeSession = useMutation(api.sessions.complete);

	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [photoData, setPhotoData] = useState<{
		shareToken: string;
		humanCode: string;
		url: string;
	} | null>(null);
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

	// Process and upload the photo
	useEffect(() => {
		if (!session || !sessionId || photoData) return;
		if (!session.capturedImageUrl) return;

		const processPhoto = async () => {
			try {
				// Composite the photo
				const photoUrl = session.capturedImageUrl;
				if (!photoUrl) {
					setError("No photo captured");
					setIsProcessing(false);
					return;
				}
				const blob = await compositePhoto({
					photo: photoUrl,
					template: template?.url
						? {
								url: template.url,
								safeArea: template.safeArea ?? undefined,
							}
						: undefined,
					caption: session.caption
						? {
								text: session.caption,
								position: template?.captionPosition ?? {
									x: 50,
									y: 900,
									maxWidth: 500,
									fontSize: 28,
									color: "#ffffff",
									align: "center" as const,
								},
							}
						: undefined,
					mirrored: session.mirrored ?? false,
					outputWidth: settings?.maxPhotoDimension ?? 1200,
					outputHeight: Math.round((settings?.maxPhotoDimension ?? 1200) * (4 / 3)),
					quality: settings?.photoQuality ?? 0.9,
				});

				// Get upload URL
				const uploadUrl = await generateUploadUrl();

				// Upload the blob
				const response = await fetch(uploadUrl, {
					method: "POST",
					headers: { "Content-Type": "image/jpeg" },
					body: blob,
				});

				const { storageId } = await response.json();

				// Create the photo record
				const result = await createPhoto({
					sessionId,
					storageId,
					caption: session.caption ?? undefined,
					templateId: templateId ?? undefined,
					width: settings?.maxPhotoDimension ?? 1200,
					height: Math.round((settings?.maxPhotoDimension ?? 1200) * (4 / 3)),
				});

				// Complete the session
				await completeSession({ sessionId });

				// Generate QR code
				const shareUrl = `${window.location.origin}/share/${result.shareToken}`;
				const qrCode = await generateQRCode(shareUrl, 300);

				setPhotoData({
					shareToken: result.shareToken,
					humanCode: result.humanCode,
					url: URL.createObjectURL(blob),
				});
				setQrCodeDataUrl(qrCode);
				setIsProcessing(false);
			} catch (err) {
				console.error("Failed to process photo:", err);
				setError("Failed to process photo. Please try again.");
				setIsProcessing(false);
			}
		};

		processPhoto();
	}, [
		session,
		sessionId,
		template,
		templateId,
		settings,
		photoData,
		generateUploadUrl,
		createPhoto,
		completeSession,
	]);

	const handleDownload = () => {
		if (!photoData) return;
		fetch(photoData.url)
			.then((res) => res.blob())
			.then((blob) => downloadBlob(blob, `photocall_${photoData.humanCode}.jpg`));
	};

	const handlePrint = () => {
		if (!photoData) return;
		printImage(photoData.url);
	};

	const handleTakeAnother = () => {
		router.push("/kiosk/select");
	};

	if (isProcessing) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
				<Loader2 className="h-16 w-16 animate-spin text-rose-500" />
				<div className="text-center">
					<h1 className="mb-2 text-2xl font-bold">Creating Your Photo...</h1>
					<p className="text-muted-foreground">This will only take a moment</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
				<div className="text-destructive">
					<p className="mb-4 text-xl font-medium">{error}</p>
				</div>
				<Button size="xl" onClick={() => router.push("/kiosk")} className="gap-2">
					<RefreshCcw className="h-6 w-6" />
					Start Over
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
			{/* Success message */}
			<div className="text-center">
				<h1 className="mb-2 text-3xl font-bold text-rose-500">Photo Saved!</h1>
				<p className="text-lg text-muted-foreground">Scan the QR code to download your photo</p>
			</div>

			{/* QR Code and Photo Preview */}
			<div className="flex flex-col items-center gap-8 md:flex-row">
				{/* Photo Preview */}
				<div className="relative aspect-[3/4] w-64 overflow-hidden rounded-xl shadow-2xl">
					{photoData && (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={photoData.url} alt="Final result" className="h-full w-full object-cover" />
					)}
				</div>

				{/* QR Code */}
				<Card className="p-6">
					<CardContent className="flex flex-col items-center gap-4 p-0">
						{qrCodeDataUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={qrCodeDataUrl} alt="QR Code" className="h-64 w-64" />
						) : (
							<div className="flex h-64 w-64 items-center justify-center">
								<QrCode className="h-32 w-32 text-muted-foreground" />
							</div>
						)}

						{/* Human-readable code */}
						{photoData && (
							<div className="text-center">
								<p className="text-sm text-muted-foreground">Or visit the link with code:</p>
								<p className="font-mono text-2xl font-bold tracking-widest">
									{photoData.humanCode}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-wrap items-center justify-center gap-4">
				<Button variant="outline" size="xl" onClick={handleDownload} className="gap-2">
					<Download className="h-6 w-6" />
					Download
				</Button>

				<Button variant="outline" size="xl" onClick={handlePrint} className="gap-2">
					<Printer className="h-6 w-6" />
					Print
				</Button>

				<Button size="xl" onClick={handleTakeAnother} className="gap-2">
					<Camera className="h-6 w-6" />
					Take Another
				</Button>
			</div>

			{/* Return to start */}
			<Link href="/kiosk" className="mt-4">
				<Button variant="ghost" size="lg">
					Return to Start
				</Button>
			</Link>
		</div>
	);
}

export default function ResultPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
				</div>
			}
		>
			<ResultPageContent />
		</Suspense>
	);
}
