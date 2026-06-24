"use client";

import { Camera, Loader2, Lock, Maximize, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent, validateKioskPin } from "@/actions/events";
import { listRecentPublicPhotos } from "@/actions/photos";
import { createKioskSession } from "@/actions/sessions";
import { KioskAttractCollage } from "@/components/kiosk-attract-collage";
import { KioskLanguagePicker } from "@/components/kiosk-language-picker";
import { KioskOperatorPanel } from "@/components/kiosk-operator-panel";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useKioskFont } from "@/hooks/use-kiosk-font";

export default function KioskAttractPage() {
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const t = useTranslations("kiosk.attract");
	const tCommon = useTranslations("kiosk.common");

	const {
		isAuthenticated: isAdmin,
		pin: adminPin,
		login: loginAdmin,
		logout: logoutAdmin,
	} = useAdminAuth();
	const { isFullscreen, supported: fullscreenSupported, enter: enterFullscreen } = useFullscreen();
	const [adminDialogOpen, setAdminDialogOpen] = useState(false);
	const [operatorPanelOpen, setOperatorPanelOpen] = useState(false);
	const [pinInput, setPinInput] = useState("");
	const [pinError, setPinError] = useState<string | null>(null);
	const [pinSubmitting, setPinSubmitting] = useState(false);
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Register service worker for offline image caching
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch(() => {
				// Service worker registration is best-effort.
			});
		}
	}, []);

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	// Pull a generous window of recent photos so the collage background has
	// enough material, and revalidate periodically (and on focus) so freshly
	// captured photos rotate into the showcase without a manual reload.
	const { data: recentPhotos } = useSWR(
		event ? ["recent-public-photos", event.id, 16] : null,
		() => listRecentPublicPhotos(event!.id, 16),
		{ refreshInterval: 30000, revalidateOnFocus: true },
	);

	// Load the event's display font (when set) and resolve a CSS font-family for
	// kiosk headings; falls back to the system font when no override is bundled.
	const headingFontFamily = useKioskFont(event?.fontFamily);

	const handleStart = async () => {
		if (!event) return;

		try {
			const sessionId = await createKioskSession(event.id);
			// When the host opts to skip the consent screen, jump straight to
			// template selection.
			const nextStep = event.skipConsent ? "select" : "consent";
			router.push(`/kiosk/${orgSlug}/${eventSlug}/${nextStep}?session=${sessionId}`);
		} catch (_error) {
			setPinError(t("couldNotStart"));
		}
	};

	const handleCornerPressStart = () => {
		if (longPressTimer.current) clearTimeout(longPressTimer.current);
		longPressTimer.current = setTimeout(() => setAdminDialogOpen(true), 1500);
	};

	const handleCornerPressEnd = () => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	};

	const handlePinSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!event || pinInput.length < 4) return;
		setPinSubmitting(true);
		setPinError(null);
		try {
			await validateKioskPin(event.id, pinInput);
			loginAdmin(pinInput);
			setAdminDialogOpen(false);
			setPinInput("");
		} catch (error) {
			setPinError(error instanceof Error ? error.message : t("invalidPin"));
		} finally {
			setPinSubmitting(false);
		}
	};

	if (eventLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">{t("eventNotFoundTitle")}</h1>
					<p className="text-muted-foreground">{t("eventNotFoundDescription")}</p>
				</div>
			</div>
		);
	}

	const primaryColor = event.primaryColor || "#e11d48";
	const accentColor = event.accentColor || primaryColor;

	// Admin overrides take precedence; an empty override falls back to the i18n
	// default (heading default is the couple names / event name).
	const attractTitle = event.attractTitle || event.coupleNames || event.name;
	const attractSubtitle = event.attractSubtitle || event.welcomeMessage || t("defaultWelcome");
	const ctaLabel = event.ctaLabel || t("start");

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
			style={{ backgroundColor: "#000" }}
		>
			{/* Animated collage background */}
			{event.slideshowEnabled && recentPhotos && recentPhotos.length > 0 && (
				<KioskAttractCollage photos={recentPhotos} safeMode={event.slideshowSafeMode} />
			)}

			{/* Content */}
			<div className="relative z-10 text-center text-white p-8">
				{event.logoUrl && (
					<img src={event.logoUrl} alt="" className="h-24 mx-auto mb-8 object-contain" />
				)}

				<h1
					className="text-4xl md:text-6xl font-bold mb-4"
					style={headingFontFamily ? { fontFamily: headingFontFamily } : undefined}
				>
					{attractTitle}
				</h1>

				<p className="text-xl md:text-2xl mb-8 opacity-80">{attractSubtitle}</p>

				<Button
					size="lg"
					onClick={handleStart}
					className="text-xl px-12 py-8 rounded-full"
					style={{ backgroundColor: primaryColor, boxShadow: `0 0 40px -8px ${accentColor}` }}
				>
					<Camera className="h-8 w-8 mr-3" />
					{ctaLabel}
				</Button>
			</div>

			{/* Guest language picker */}
			<div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
				<KioskLanguagePicker className="gap-2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white" />
			</div>

			{/* Organization branding (admin can hide the "Powered by" footer) */}
			{event.showPoweredBy ? (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm">
					{tCommon("poweredBy")}
				</div>
			) : null}

			{/* Subtle fullscreen affordance — fullscreen requires a user gesture, so
			    it can't be entered automatically. Hidden once already fullscreen or
			    where the API is unavailable (e.g. iOS Safari uses standalone PWA). */}
			{fullscreenSupported && !isFullscreen ? (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => void enterFullscreen()}
					className="absolute bottom-3 right-4 z-20 text-white/40 hover:bg-white/10 hover:text-white"
				>
					<Maximize className="mr-2 h-4 w-4" aria-hidden="true" />
					{t("enterFullscreen")}
				</Button>
			) : null}

			{/* Admin escape: long-press top-left corner */}
			<button
				type="button"
				aria-label={t("openAdminControls")}
				className="absolute top-0 left-0 h-16 w-16 cursor-default opacity-0"
				onMouseDown={handleCornerPressStart}
				onMouseUp={handleCornerPressEnd}
				onMouseLeave={handleCornerPressEnd}
				onTouchStart={handleCornerPressStart}
				onTouchEnd={handleCornerPressEnd}
			/>

			{isAdmin ? (
				<div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur">
					<Button
						size="sm"
						variant="ghost"
						className="text-white hover:bg-white/10"
						onClick={() => {
							// The raw PIN lives only in memory, so a reload that restored the
							// session flag has `isAdmin` but no PIN. The operator panel needs
							// the PIN for server-side verification, so re-prompt in that case.
							if (adminPin) {
								setOperatorPanelOpen(true);
							} else {
								setAdminDialogOpen(true);
							}
						}}
					>
						<Lock className="mr-2 h-4 w-4" aria-hidden="true" />
						{t("admin")}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="text-white hover:bg-white/10"
						aria-label={t("endAdminSession")}
						onClick={logoutAdmin}
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</Button>
				</div>
			) : null}

			<Dialog
				open={adminDialogOpen}
				onOpenChange={(open) => {
					setAdminDialogOpen(open);
					if (!open) {
						setPinInput("");
						setPinError(null);
					}
				}}
			>
				<DialogContent>
					<form onSubmit={handlePinSubmit}>
						<DialogHeader>
							<DialogTitle>{t("pinDialogTitle")}</DialogTitle>
							<DialogDescription>{t("pinDialogDescription")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-3 py-4">
							<Label htmlFor="kiosk-admin-pin">{t("pinLabel")}</Label>
							<Input
								id="kiosk-admin-pin"
								type="password"
								inputMode="numeric"
								autoComplete="off"
								value={pinInput}
								onChange={(e) => {
									setPinInput(e.target.value);
									if (pinError) setPinError(null);
								}}
								aria-invalid={pinError ? "true" : undefined}
								aria-describedby={pinError ? "kiosk-pin-error" : undefined}
							/>
							{pinError ? (
								<p id="kiosk-pin-error" className="text-sm text-destructive">
									{pinError}
								</p>
							) : null}
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setAdminDialogOpen(false)}>
								{tCommon("cancel")}
							</Button>
							<Button type="submit" disabled={pinSubmitting || pinInput.length < 4}>
								{pinSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								{t("unlock")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{isAdmin && adminPin ? (
				<KioskOperatorPanel
					open={operatorPanelOpen}
					onOpenChange={setOperatorPanelOpen}
					event={event}
					orgSlug={orgSlug}
					eventSlug={eventSlug}
					pin={adminPin}
				/>
			) : null}
		</div>
	);
}
