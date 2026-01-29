"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { Camera, Download, ExternalLink, Printer } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { downloadBlob, printImage } from "@/lib/canvas-utils";

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = use(params);
	const photo = useQuery(api.photos.getByShareToken, { shareToken: token });

	const handleDownload = async () => {
		if (!photo?.url) return;
		const response = await fetch(photo.url);
		const blob = await response.blob();
		downloadBlob(blob, `photocall_${photo.humanCode}.jpg`);
	};

	const handlePrint = () => {
		if (!photo?.url) return;
		printImage(photo.url);
	};

	// Loading state
	if (photo === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
			</div>
		);
	}

	// Not found state
	if (photo === null) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-rose-50 to-white p-8 dark:from-rose-950 dark:to-background">
				<Camera className="h-20 w-20 text-muted-foreground" />
				<div className="text-center">
					<h1 className="mb-2 text-2xl font-bold">Photo Not Found</h1>
					<p className="mb-6 text-muted-foreground">This photo may have expired or been deleted.</p>
				</div>
				<Link href="/">
					<Button>
						<Camera className="mr-2 h-5 w-5" />
						Visit Photocall
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			{/* Header */}
			<header className="border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<Link href="/" className="flex items-center gap-2">
						<Camera className="h-6 w-6 text-rose-500" />
						<span className="text-xl font-bold">Photocall</span>
					</Link>
				</div>
			</header>

			<main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
				{/* Photo Card */}
				<Card className="w-full max-w-2xl overflow-hidden">
					<div className="relative aspect-[3/4] w-full bg-muted">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={photo.url ?? ""}
							alt={`Captured moment ${photo.humanCode}`}
							className="h-full w-full object-contain"
						/>
					</div>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Camera className="h-5 w-5 text-rose-500" />
							Photo {photo.humanCode}
						</CardTitle>
						<CardDescription>
							Taken on{" "}
							{new Date(photo.createdAt).toLocaleDateString(undefined, {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</CardDescription>
						{photo.caption && (
							<p className="mt-2 text-lg italic text-foreground">"{photo.caption}"</p>
						)}
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-3">
							<Button onClick={handleDownload} className="flex-1 gap-2">
								<Download className="h-5 w-5" />
								Download
							</Button>
							<Button variant="outline" onClick={handlePrint} className="flex-1 gap-2">
								<Printer className="h-5 w-5" />
								Print
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Share info */}
				<Card className="w-full max-w-2xl">
					<CardContent className="py-6">
						<div className="flex items-center gap-4">
							<ExternalLink className="h-8 w-8 text-muted-foreground" />
							<div className="flex-1">
								<p className="font-medium">Share this photo</p>
								<p className="text-sm text-muted-foreground">
									Copy the link or share directly with friends and family
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => {
									navigator.clipboard.writeText(window.location.href);
								}}
							>
								Copy Link
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* CTA */}
				<div className="text-center">
					<p className="mb-4 text-muted-foreground">Want to take your own photo?</p>
					<Link href="/kiosk">
						<Button variant="outline" className="gap-2">
							<Camera className="h-5 w-5" />
							Start Photo Booth
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
