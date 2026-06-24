"use client";

import { Camera, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";
import useSWR from "swr";
import { getPhotoByShareToken } from "@/actions/photos";
import { EventI18nProvider } from "@/components/event-i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { downloadBlob } from "@/lib/canvas-utils";

type SharedPhoto = NonNullable<Awaited<ReturnType<typeof getPhotoByShareToken>>>;

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = use(params);
	const { data: photo, isLoading } = useSWR(["share-photo", token], () =>
		getPhotoByShareToken(token),
	);

	// Loading state — kept locale-agnostic (no translations needed) so it can
	// render before the event (and its language) has resolved.
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
			</div>
		);
	}

	// Once the photo (and therefore the event language) is known, render the rest
	// of the page in the event's language.
	return (
		<EventI18nProvider eventLanguage={photo?.language}>
			<SharePageContent photo={photo ?? null} />
		</EventI18nProvider>
	);
}

function SharePageContent({ photo }: { photo: SharedPhoto | null }) {
	const t = useTranslations("share");
	const { toast } = useToast();

	const handleDownload = async () => {
		if (!photo?.url) return;
		const response = await fetch(photo.url);
		const blob = await response.blob();
		const ext = photo.kind === "boomerang" ? "gif" : "jpg";
		downloadBlob(blob, `photocall_${photo.humanCode}.${ext}`);
	};

	const handleShare = async () => {
		if (!photo?.url) return;

		const shareUrl = window.location.href;
		const title = photo.eventName || t("defaultTitle");
		const text = t("shareText", { event: title });

		// Web Share API. Prefer sharing the actual image file (so the recipient
		// gets the photo, not just a link) when the platform supports file shares;
		// otherwise share the URL. Fall back to copying the link when Web Share is
		// unavailable (most desktop browsers).
		if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
			try {
				const ext = photo.kind === "boomerang" ? "gif" : "jpg";
				const type = photo.kind === "boomerang" ? "image/gif" : "image/jpeg";
				let file: File | null = null;
				try {
					const response = await fetch(photo.url);
					const blob = await response.blob();
					file = new File([blob], `photocall_${photo.humanCode}.${ext}`, { type });
				} catch {
					file = null;
				}

				if (file && navigator.canShare?.({ files: [file] })) {
					await navigator.share({ title, text, url: shareUrl, files: [file] });
				} else {
					await navigator.share({ title, text, url: shareUrl });
				}
				return;
			} catch (error) {
				// The user dismissed the share sheet — that's not an error.
				if (error instanceof DOMException && error.name === "AbortError") return;
				// Otherwise fall through to the copy-link fallback below.
			}
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			toast({ title: t("linkCopied") });
		} catch {
			window.open(photo.url, "_blank", "noopener,noreferrer");
		}
	};

	// Not found state
	if (!photo) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-linear-to-b from-rose-50 to-white p-8 dark:from-rose-950 dark:to-background">
				<Camera className="h-20 w-20 text-muted-foreground" />
				<div className="text-center">
					<h1 className="mb-2 text-2xl font-bold">{t("notFoundTitle")}</h1>
					<p className="mb-6 text-muted-foreground">{t("notFoundDescription")}</p>
				</div>
				<Link href="/">
					<Button>
						<Camera className="mr-2 h-5 w-5" />
						{t("visitPhotocall")}
					</Button>
				</Link>
			</div>
		);
	}

	const primaryColor = photo.primaryColor || DEFAULT_BRAND_COLOR;

	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			{/* Header — branded with the event's identity (name, logo, colour). */}
			<header className="border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<div className="flex items-center gap-2">
						{photo.logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={photo.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
						) : (
							<Camera className="h-6 w-6" style={{ color: primaryColor }} />
						)}
						<span className="text-xl font-bold">{photo.eventName || t("defaultTitle")}</span>
					</div>
				</div>
			</header>

			<main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
				{/* Photo Card */}
				<Card className="w-full max-w-2xl overflow-hidden">
					<div className="relative aspect-3/4 w-full bg-muted">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={photo.url ?? ""}
							alt={t("photoAlt", { code: photo.humanCode })}
							className="h-full w-full object-contain"
						/>
					</div>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Camera className="h-5 w-5" style={{ color: primaryColor }} />
							{t("photoTitle", { code: photo.humanCode })}
						</CardTitle>
						<CardDescription>
							{t("takenOn", {
								date: new Date(photo.createdAt).toLocaleDateString(undefined, {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								}),
							})}
						</CardDescription>
						{photo.caption && (
							<p className="mt-2 text-lg italic text-foreground">"{photo.caption}"</p>
						)}
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-3">
							{photo.allowDownload && (
								<Button
									onClick={handleDownload}
									className="flex-1 gap-2"
									style={{ backgroundColor: primaryColor }}
								>
									<Download className="h-5 w-5" />
									{t("download")}
								</Button>
							)}
							<Button variant="outline" onClick={handleShare} className="flex-1 gap-2">
								<Share2 className="h-5 w-5" />
								{t("share")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
