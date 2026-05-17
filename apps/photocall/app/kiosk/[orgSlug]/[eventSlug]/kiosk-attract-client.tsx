"use client";

import { Camera, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { listRecentPublicPhotos } from "@/actions/photos";
import { createKioskSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";

export default function KioskAttractPage() {
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	// Register service worker for offline image caching
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch((err) => {
				console.error("SW registration failed:", err);
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
		} catch (error) {
			console.error("Failed to start session:", error);
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
		</div>
	);
}
