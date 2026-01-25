"use client";

import { useQuery } from "convex/react";
import { Camera, Download, Image, LogOut, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminDashboard() {
	const router = useRouter();
	const { isAuthenticated, isLoading, logout } = useAdminAuth();
	const photoCount = useQuery(api.photos.getCount);
	const stats = useQuery(api.sessions.getStats);
	const templates = useQuery(api.templates.list, {});

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/admin");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading || !isAuthenticated) {
		return null;
	}

	const handleLogout = () => {
		logout();
		router.push("/admin");
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Header */}
			<header className="border-b bg-background">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<div className="flex items-center gap-2">
						<Camera className="h-6 w-6 text-rose-500" />
						<span className="text-xl font-bold">Photocall Admin</span>
					</div>
					<div className="flex items-center gap-2">
						<Link href="/kiosk">
							<Button variant="outline" size="sm">
								<Camera className="mr-2 h-4 w-4" />
								Kiosk Mode
							</Button>
						</Link>
						<Button variant="ghost" size="sm" onClick={handleLogout}>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Stats */}
				<div className="mb-8 grid gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Photos</CardDescription>
							<CardTitle className="text-3xl">{photoCount ?? 0}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Sessions Started</CardDescription>
							<CardTitle className="text-3xl">{stats?.total ?? 0}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Completion Rate</CardDescription>
							<CardTitle className="text-3xl">
								{stats ? `${Math.round(stats.completionRate * 100)}%` : "0%"}
							</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Active Templates</CardDescription>
							<CardTitle className="text-3xl">
								{templates?.filter((t: { enabled: boolean }) => t.enabled).length ?? 0}
							</CardTitle>
						</CardHeader>
					</Card>
				</div>

				{/* Quick Actions */}
				<h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<Link href="/admin/gallery">
						<Card className="cursor-pointer transition-shadow hover:shadow-md">
							<CardHeader>
								<Image className="mb-2 h-8 w-8 text-rose-500" />
								<CardTitle>Photo Gallery</CardTitle>
								<CardDescription>
									View, download, and manage all photos taken at your event.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full">
									<Image className="mr-2 h-4 w-4" />
									Open Gallery
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link href="/admin/templates">
						<Card className="cursor-pointer transition-shadow hover:shadow-md">
							<CardHeader>
								<Sparkles className="mb-2 h-8 w-8 text-rose-500" />
								<CardTitle>Templates</CardTitle>
								<CardDescription>
									Upload and manage photo overlay templates and frames.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full">
									<Sparkles className="mr-2 h-4 w-4" />
									Manage Templates
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link href="/admin/settings">
						<Card className="cursor-pointer transition-shadow hover:shadow-md">
							<CardHeader>
								<Settings className="mb-2 h-8 w-8 text-rose-500" />
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Configure kiosk behavior, camera settings, and more.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full">
									<Settings className="mr-2 h-4 w-4" />
									Open Settings
								</Button>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* Export Section */}
				<div className="mt-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Download className="h-5 w-5" />
								Export All Photos
							</CardTitle>
							<CardDescription>
								Download all {photoCount ?? 0} photos as a ZIP file.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/admin/gallery?export=true">
								<Button variant="outline">
									<Download className="mr-2 h-4 w-4" />
									Go to Gallery to Export
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
