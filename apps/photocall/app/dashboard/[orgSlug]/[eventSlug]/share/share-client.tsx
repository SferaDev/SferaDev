"use client";

import {
	Check,
	ChevronLeft,
	Copy,
	Download,
	Images,
	Loader2,
	Settings,
	Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

/**
 * Builds the public guest-album URL for an album token, anchored to the current
 * origin. Returns `null` until the component has mounted in the browser (the
 * origin is not known during SSR).
 */
function useAlbumUrl(albumToken: string | null): string | null {
	const [origin, setOrigin] = useState<string | null>(null);

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	if (!origin || !albumToken) return null;
	return `${origin}/a/${albumToken}`;
}

/**
 * Admin "Share" page: renders a large QR code for the event's public guest
 * album so operators can print or hand it out. Offers a PNG download, the Web
 * Share API (sharing the PNG when supported), and a clipboard fallback. When
 * the album is disabled it shows an empty state pointing at the event settings.
 */
export default function ShareClient() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const t = useTranslations("dashboard.share");
	const te = useTranslations("dashboard.events");
	const tc = useTranslations("dashboard.common");

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);

	const albumToken = event?.albumEnabled ? (event.albumToken ?? null) : null;
	const albumUrl = useAlbumUrl(albumToken);

	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!albumUrl) {
			setQrDataUrl(null);
			return;
		}
		let active = true;
		QRCode.toDataURL(albumUrl, {
			width: 512,
			margin: 2,
			color: { dark: "#000000", light: "#ffffff" },
		})
			.then((url) => {
				if (active) setQrDataUrl(url);
			})
			.catch((error) => {
				console.warn("QR generation failed:", error);
			});
		return () => {
			active = false;
		};
	}, [albumUrl]);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	if (authLoading || event === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">{te("notFoundTitle")}</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{tc("backToOrganization")}
					</Button>
				</div>
			</div>
		);
	}

	/** Filename for the downloaded/shared QR PNG, derived from the event slug. */
	const fileName = `${event.slug}-album-qr.png`;

	const handleDownload = () => {
		if (!qrDataUrl) return;
		const link = document.createElement("a");
		link.href = qrDataUrl;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleCopyLink = async () => {
		if (!albumUrl) return;
		await navigator.clipboard.writeText(albumUrl);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	};

	const handleShare = async () => {
		if (!albumUrl) return;
		const shareData: ShareData = {
			title: event.name,
			text: t("shareText", { name: event.name }),
			url: albumUrl,
		};

		// Prefer sharing the QR image itself when the platform supports file shares.
		if (qrDataUrl && typeof navigator.canShare === "function") {
			try {
				const blob = await fetch(qrDataUrl).then((response) => response.blob());
				const file = new File([blob], fileName, { type: blob.type });
				if (navigator.canShare({ files: [file] })) {
					await navigator.share({ ...shareData, files: [file] });
					return;
				}
			} catch (error) {
				// Fall through to a URL-only share / copy fallback below.
				console.warn("File share failed, falling back:", error);
			}
		}

		if (typeof navigator.share === "function") {
			try {
				await navigator.share(shareData);
				return;
			} catch (error) {
				console.warn("Share failed, falling back to copy:", error);
			}
		}

		await handleCopyLink();
	};

	const canWebShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center gap-4">
					<Link
						href={`/dashboard/${orgSlug}/${eventSlug}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<ChevronLeft className="h-5 w-5" />
					</Link>
					<div className="flex-1">
						<h1 className="font-bold text-xl">{t("title")}</h1>
						<p className="text-sm text-muted-foreground">{event.name}</p>
					</div>
				</div>
			</header>

			<main className="container mx-auto max-w-xl px-4 py-8">
				{albumUrl ? (
					<Card>
						<CardContent className="flex flex-col items-center gap-6 p-8">
							<div className="text-center space-y-1">
								<h2 className="text-lg font-semibold">{event.name}</h2>
								<p className="text-sm text-muted-foreground">{t("scanToView")}</p>
							</div>

							<div className="rounded-xl border bg-white p-4">
								{qrDataUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={qrDataUrl} alt={t("title")} className="h-64 w-64" />
								) : (
									<div className="flex h-64 w-64 items-center justify-center">
										<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
									</div>
								)}
							</div>

							<p className="w-full select-all break-all text-center text-sm text-muted-foreground">
								{albumUrl}
							</p>

							<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
								<Button onClick={handleDownload} disabled={!qrDataUrl}>
									<Download className="h-4 w-4 mr-2" />
									{t("downloadPng")}
								</Button>
								{canWebShare ? (
									<Button variant="outline" onClick={handleShare}>
										<Share2 className="h-4 w-4 mr-2" />
										{t("share")}
									</Button>
								) : (
									<Button variant="outline" onClick={handleCopyLink}>
										{copied ? (
											<Check className="h-4 w-4 mr-2" />
										) : (
											<Copy className="h-4 w-4 mr-2" />
										)}
										{copied ? t("linkCopied") : t("copyLink")}
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center gap-4 p-12 text-center">
							<Images className="h-12 w-12 text-muted-foreground" />
							<div className="space-y-1">
								<h2 className="text-xl font-semibold">{t("albumDisabledTitle")}</h2>
								<p className="text-muted-foreground">{t("albumDisabledBody")}</p>
							</div>
							<Button asChild>
								<Link href={`/dashboard/${orgSlug}/${eventSlug}/settings`}>
									<Settings className="h-4 w-4 mr-2" />
									{t("enableInSettings")}
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
