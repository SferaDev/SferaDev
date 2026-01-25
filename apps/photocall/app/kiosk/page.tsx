"use client";

import { useQuery } from "convex/react";
import { Camera, Hand } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type Photo = { _id: string; url: string | null };

export default function KioskAttractScreen() {
	const recentPhotos = useQuery(api.photos.listRecent, { limit: 6 });
	const settings = useQuery(api.settings.get);
	const [currentSlide, setCurrentSlide] = useState(0);

	// Slideshow logic
	useEffect(() => {
		if (!settings?.slideshowEnabled || !recentPhotos?.length) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % recentPhotos.length);
		}, 4000);

		return () => clearInterval(interval);
	}, [settings?.slideshowEnabled, recentPhotos?.length]);

	const showSlideshow = settings?.slideshowEnabled && recentPhotos && recentPhotos.length > 0;

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
			{/* Background slideshow */}
			{showSlideshow && (
				<div className="absolute inset-0 z-0">
					{recentPhotos.map((photo: Photo, index: number) => (
						<div
							key={photo._id}
							className={`absolute inset-0 transition-opacity duration-1000 ${
								index === currentSlide ? "opacity-30" : "opacity-0"
							}`}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={photo.url ?? ""}
								alt=""
								className={`h-full w-full object-cover ${settings.slideshowSafeMode ? "blur-xl" : ""}`}
							/>
						</div>
					))}
					<div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 to-white/90 dark:from-rose-950/80 dark:to-background/90" />
				</div>
			)}

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center text-center">
				{/* Logo/Title */}
				<div className="mb-8 flex items-center gap-3">
					<Camera className="h-16 w-16 text-rose-500" />
					<h1 className="text-5xl font-bold tracking-tight md:text-7xl">Photocall</h1>
				</div>

				{/* Animated hand icon */}
				<div className="mb-8 animate-bounce">
					<Hand className="h-20 w-20 text-rose-500 opacity-80" />
				</div>

				{/* CTA */}
				<Link href="/kiosk/select">
					<Button
						size="xl"
						className="h-24 px-16 text-2xl shadow-2xl transition-transform hover:scale-105"
					>
						<Camera className="mr-4 h-8 w-8" />
						Tap to Start
					</Button>
				</Link>

				{/* Subtitle */}
				<p className="mt-8 text-xl text-muted-foreground">Take a photo and share the memory!</p>
			</div>

			{/* Photo count indicator */}
			{showSlideshow && (
				<div className="absolute bottom-8 flex gap-2">
					{recentPhotos.map((_: Photo, index: number) => (
						<div
							key={index}
							className={`h-2 w-2 rounded-full transition-colors ${
								index === currentSlide ? "bg-rose-500" : "bg-rose-200"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
