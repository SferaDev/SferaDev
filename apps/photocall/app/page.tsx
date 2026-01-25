import { Camera, Download, QrCode, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			{/* Hero Section */}
			<header className="container mx-auto px-4 py-6">
				<nav className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Camera className="h-8 w-8 text-rose-500" />
						<span className="text-2xl font-bold">Photocall</span>
					</div>
					<div className="flex items-center gap-4">
						<Link href="/admin">
							<Button variant="ghost">Admin</Button>
						</Link>
						<Link href="/kiosk">
							<Button>Start Kiosk</Button>
						</Link>
					</div>
				</nav>
			</header>

			<main>
				{/* Hero */}
				<section className="container mx-auto px-4 py-20 text-center">
					<div className="mx-auto max-w-3xl">
						<h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
							Capture Beautiful
							<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
								{" "}
								Wedding Memories
							</span>
						</h1>
						<p className="mb-8 text-xl text-muted-foreground">
							A modern photo booth kiosk for weddings and events. Easy setup, beautiful templates,
							instant sharing.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/kiosk">
								<Button size="xl" className="gap-2">
									<Camera className="h-5 w-5" />
									Launch Kiosk
								</Button>
							</Link>
							<Link href="/admin">
								<Button size="xl" variant="outline" className="gap-2">
									<Settings className="h-5 w-5" />
									Admin Panel
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Features */}
				<section className="container mx-auto px-4 py-20">
					<h2 className="mb-12 text-center text-3xl font-bold">Everything You Need</h2>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<Camera className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>Easy Capture</CardTitle>
								<CardDescription>
									Large touch controls, countdown timer, and instant preview. Perfect for any guest.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Sparkles className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>Beautiful Templates</CardTitle>
								<CardDescription>
									Customize with your own frames and overlays. Add captions to personalize each
									photo.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<QrCode className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>Instant Sharing</CardTitle>
								<CardDescription>
									Guests get a QR code to instantly download and share their photos. No app needed.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Download className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>Easy Export</CardTitle>
								<CardDescription>
									Download all photos as a ZIP. Perfect for creating wedding albums and sharing
									later.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>

				{/* How it works */}
				<section className="bg-muted/50 py-20">
					<div className="container mx-auto px-4">
						<h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
						<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									1
								</div>
								<h3 className="mb-2 text-xl font-semibold">Set Up</h3>
								<p className="text-muted-foreground">
									Configure your templates and settings in the admin panel. Upload your custom
									frames.
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									2
								</div>
								<h3 className="mb-2 text-xl font-semibold">Capture</h3>
								<p className="text-muted-foreground">
									Guests tap to start, choose a template, and take their photo with a fun countdown.
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									3
								</div>
								<h3 className="mb-2 text-xl font-semibold">Share</h3>
								<p className="text-muted-foreground">
									Scan the QR code to instantly download and share. Print directly from the kiosk.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="container mx-auto px-4 py-20 text-center">
					<Card className="mx-auto max-w-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white">
						<CardContent className="p-10">
							<h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
							<p className="mb-6 text-rose-100">
								Set up your photo booth in minutes. No installation required.
							</p>
							<Link href="/kiosk">
								<Button size="xl" variant="secondary" className="gap-2">
									<Camera className="h-5 w-5" />
									Launch Kiosk Now
								</Button>
							</Link>
						</CardContent>
					</Card>
				</section>
			</main>

			<footer className="border-t py-8">
				<div className="container mx-auto px-4 text-center text-muted-foreground">
					<p>Photocall - Wedding Photo Booth Kiosk</p>
				</div>
			</footer>
		</div>
	);
}
