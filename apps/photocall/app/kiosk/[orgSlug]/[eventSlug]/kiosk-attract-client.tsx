"use client";

import { Camera, Loader2, Lock, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { getPublicEvent, validateKioskPin } from "@/actions/events";
import { listRecentPublicPhotos } from "@/actions/photos";
import { createKioskSession } from "@/actions/sessions";
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

export default function KioskAttractPage() {
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const { isAuthenticated: isAdmin, login: loginAdmin, logout: logoutAdmin } = useAdminAuth();
	const [adminDialogOpen, setAdminDialogOpen] = useState(false);
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

	const { data: recentPhotos } = useSWR(event ? ["recent-public-photos", event.id, 10] : null, () =>
		listRecentPublicPhotos(event!.id, 10),
	);

	const [currentSlide, setCurrentSlide] = useState(0);

	// Slideshow effect
	useEffect(() => {
		if (!event?.slideshowEnabled || !recentPhotos?.length) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % recentPhotos.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [event?.slideshowEnabled, recentPhotos?.length]);

	const handleStart = async () => {
		if (!event) return;

		try {
			const sessionId = await createKioskSession(event.id);
			router.push(`/kiosk/${orgSlug}/${eventSlug}/consent?session=${sessionId}`);
		} catch (_error) {
			setPinError("Could not start session. Please try again.");
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
			loginAdmin();
			setAdminDialogOpen(false);
			setPinInput("");
		} catch (error) {
			setPinError(error instanceof Error ? error.message : "Invalid PIN");
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
					<h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
					<p className="text-muted-foreground">This event is not active or does not exist.</p>
				</div>
			</div>
		);
	}

	const primaryColor = event.primaryColor || "#6366f1";

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
			style={{ backgroundColor: "#000" }}
		>
			{/* Slideshow Background */}
			{event.slideshowEnabled && recentPhotos && recentPhotos.length > 0 && (
				<div className="absolute inset-0">
					{recentPhotos.map((photo, index) => (
						<div
							key={photo.id}
							className={`absolute inset-0 transition-opacity duration-1000 ${
								index === currentSlide ? "opacity-50" : "opacity-0"
							}`}
						>
							{photo.url && (
								<img
									src={photo.url}
									alt=""
									className={`w-full h-full object-cover ${
										event.slideshowSafeMode ? "blur-xl" : ""
									}`}
								/>
							)}
						</div>
					))}
				</div>
			)}

			{/* Content */}
			<div className="relative z-10 text-center text-white p-8">
				{event.logoUrl && (
					<img src={event.logoUrl} alt="" className="h-24 mx-auto mb-8 object-contain" />
				)}

				<h1 className="text-4xl md:text-6xl font-bold mb-4">{event.name}</h1>

				<p className="text-xl md:text-2xl mb-8 opacity-80">
					{event.welcomeMessage || "Tap to capture your moment"}
				</p>

				<Button
					size="lg"
					onClick={handleStart}
					className="text-xl px-12 py-8 rounded-full"
					style={{ backgroundColor: primaryColor }}
				>
					<Camera className="h-8 w-8 mr-3" />
					Start
				</Button>
			</div>

			{/* Organization branding */}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm">
				Powered by Photocall
			</div>

			{/* Admin escape: long-press top-left corner */}
			<button
				type="button"
				aria-label="Open admin controls"
				className="absolute top-0 left-0 h-16 w-16 cursor-default opacity-0"
				onMouseDown={handleCornerPressStart}
				onMouseUp={handleCornerPressEnd}
				onMouseLeave={handleCornerPressEnd}
				onTouchStart={handleCornerPressStart}
				onTouchEnd={handleCornerPressEnd}
			/>

			{isAdmin ? (
				<div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur">
					<Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/10">
						<Link href={`/dashboard/${orgSlug}/${eventSlug}/settings`}>
							<Lock className="mr-2 h-4 w-4" aria-hidden="true" />
							Admin
						</Link>
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="text-white hover:bg-white/10"
						aria-label="End admin session"
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
							<DialogTitle>Enter admin PIN</DialogTitle>
							<DialogDescription>
								Unlock kiosk admin controls. Configure the PIN from event settings.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3 py-4">
							<Label htmlFor="kiosk-admin-pin">PIN</Label>
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
								Cancel
							</Button>
							<Button type="submit" disabled={pinSubmitting || pinInput.length < 4}>
								{pinSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								Unlock
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
