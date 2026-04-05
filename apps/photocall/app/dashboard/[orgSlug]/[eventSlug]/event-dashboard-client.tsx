"use client";

import JSZip from "jszip";
import {
	Camera,
	ChevronLeft,
	Download,
	ExternalLink,
	Image,
	Layout,
	Loader2,
	Play,
	Settings,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getEventBySlug, getEventStats, updateEvent } from "@/actions/events";
import { deleteAllPhotos, deletePhoto, listPhotos } from "@/actions/photos";
import { listTemplates } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

export default function EventDashboard() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const { mutate } = useSWRConfig();

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);

	const { data: photos } = useSWR(event ? ["photos", event.id] : null, () =>
		listPhotos(event!.id, 50),
	);

	const { data: templates } = useSWR(event ? ["templates", event.id] : null, () =>
		listTemplates(event!.id),
	);

	const { data: stats } = useSWR(event ? ["eventStats", event.id] : null, () =>
		getEventStats(event!.id),
	);

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
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Event not found</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back to Organization
					</Button>
				</div>
			</div>
		);
	}

	const toggleStatus = async () => {
		const newStatus = event.status === "active" ? "paused" : "active";
		await updateEvent(event.id, { status: newStatus });
		mutate((key) => Array.isArray(key) && key[0] === "events");
		mutate((key) => Array.isArray(key) && key[0] === "eventStats");
	};

	const handleRemovePhoto = async (photoId: string) => {
		await deletePhoto(photoId);
		mutate((key) => Array.isArray(key) && key[0] === "photos");
		mutate((key) => Array.isArray(key) && key[0] === "eventStats");
	};

	const handleRemoveAllPhotos = async () => {
		await deleteAllPhotos(event.id);
		mutate((key) => Array.isArray(key) && key[0] === "photos");
		mutate((key) => Array.isArray(key) && key[0] === "eventStats");
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link
								href={`/dashboard/${orgSlug}`}
								className="text-muted-foreground hover:text-foreground"
							>
								<ChevronLeft className="h-5 w-5" />
							</Link>
							<div>
								<h1 className="font-bold text-xl">{event.name}</h1>
								<p className="text-sm text-muted-foreground">{event.organization?.name}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={event.status === "active" ? "default" : "outline"}
								onClick={toggleStatus}
							>
								{event.status === "active" ? (
									<>
										<Play className="h-4 w-4 mr-2" />
										Active
									</>
								) : (
									<>
										<Play className="h-4 w-4 mr-2" />
										Activate
									</>
								)}
							</Button>
							{event.status === "active" && (
								<Button variant="outline" asChild>
									<Link href={`/kiosk/${orgSlug}/${eventSlug}`} target="_blank">
										<ExternalLink className="h-4 w-4 mr-2" />
										Open Kiosk
									</Link>
								</Button>
							)}
							<Button variant="ghost" size="icon" asChild>
								<Link href={`/dashboard/${orgSlug}/${eventSlug}/settings`}>
									<Settings className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Stats */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-4 mb-8">
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Total Photos</div>
							<div className="text-2xl font-bold">{stats.photoCount}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Total Sessions</div>
							<div className="text-2xl font-bold">{stats.sessionCount}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Completed</div>
							<div className="text-2xl font-bold">{stats.completedSessions}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Conversion Rate</div>
							<div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
						</div>
					</div>
				)}

				<Tabs defaultValue="gallery" className="space-y-6">
					<TabsList>
						<TabsTrigger value="gallery">
							<Image className="h-4 w-4 mr-2" />
							Gallery
						</TabsTrigger>
						<TabsTrigger value="templates">
							<Layout className="h-4 w-4 mr-2" />
							Templates
						</TabsTrigger>
					</TabsList>

					<TabsContent value="gallery">
						<GalleryTab
							photos={photos?.items ?? []}
							onRemove={handleRemovePhoto}
							onRemoveAll={handleRemoveAllPhotos}
						/>
					</TabsContent>

					<TabsContent value="templates">
						<TemplatesTab templates={templates ?? []} orgSlug={orgSlug} eventSlug={eventSlug} />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}

function GalleryTab({
	photos,
	onRemove,
	onRemoveAll,
}: {
	photos: any[];
	onRemove: (id: string) => void;
	onRemoveAll: () => void;
}) {
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
	const [isExporting, setIsExporting] = useState(false);

	const _toggleSelect = (id: string) => {
		const newSelected = new Set(selectedPhotos);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedPhotos(newSelected);
	};

	const handleExportAll = async () => {
		setIsExporting(true);
		try {
			const zip = new JSZip();

			const downloads = photos
				.filter((photo) => photo.url)
				.map(async (photo) => {
					const response = await fetch(photo.url);
					const blob = await response.blob();
					const extension = blob.type.split("/")[1] ?? "jpg";
					zip.file(`${photo.humanCode}.${extension}`, blob);
				});

			await Promise.all(downloads);

			const content = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(content);
			const link = document.createElement("a");
			link.href = url;
			link.download = "photos.zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} finally {
			setIsExporting(false);
		}
	};

	if (photos.length === 0) {
		return (
			<div className="text-center py-16 border rounded-lg bg-muted/50">
				<Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h2 className="text-xl font-semibold mb-2">No photos yet</h2>
				<p className="text-muted-foreground">Photos will appear here as guests capture them</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground">{photos.length} photos</p>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={handleExportAll} disabled={isExporting}>
						{isExporting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Download className="h-4 w-4 mr-2" />
						)}
						{isExporting ? "Exporting..." : "Export All"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onRemoveAll}
						className="text-destructive hover:text-destructive"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete All
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{photos.map((photo) => (
					<div
						key={photo.id}
						className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
					>
						{photo.url && (
							<img
								src={photo.url}
								alt={`Captured moment ${photo.humanCode}`}
								className="w-full h-full object-cover"
							/>
						)}
						<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
							<Button
								size="icon"
								variant="secondary"
								onClick={() => window.open(`/share/${photo.shareToken}`, "_blank")}
							>
								<ExternalLink className="h-4 w-4" />
							</Button>
							<Button size="icon" variant="destructive" onClick={() => onRemove(photo.id)}>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
							{photo.humanCode}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function TemplatesTab({
	templates,
	orgSlug,
	eventSlug,
}: {
	templates: any[];
	orgSlug: string;
	eventSlug: string;
}) {
	if (templates.length === 0) {
		return (
			<div className="text-center py-16 border rounded-lg bg-muted/50">
				<Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h2 className="text-xl font-semibold mb-2">No templates yet</h2>
				<p className="text-muted-foreground mb-4">Add overlay templates for your photo booth</p>
				<Button asChild>
					<Link href={`/dashboard/${orgSlug}/${eventSlug}/templates`}>Add Template</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground">{templates.length} templates</p>
				<Button asChild>
					<Link href={`/dashboard/${orgSlug}/${eventSlug}/templates`}>Manage Templates</Link>
				</Button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{templates.map((template) => (
					<div
						key={template.id}
						className="relative group aspect-3/4 rounded-lg overflow-hidden bg-muted border"
					>
						{template.thumbnailUrl && (
							<img
								src={template.thumbnailUrl}
								alt={template.name}
								className="w-full h-full object-cover"
							/>
						)}
						<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<Button size="sm" variant="secondary" asChild>
								<Link href={`/dashboard/${orgSlug}/${eventSlug}/templates`}>Edit</Link>
							</Button>
						</div>
						<div className="absolute bottom-0 inset-x-0 p-2 bg-linear-to-t from-black/80 to-transparent">
							<p className="text-sm text-white font-medium truncate">{template.name}</p>
							<p className="text-xs text-white/60">{template.enabled ? "Enabled" : "Disabled"}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
