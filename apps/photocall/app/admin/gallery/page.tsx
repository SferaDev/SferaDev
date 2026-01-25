"use client";

import { useMutation, useQuery } from "convex/react";
import JSZip from "jszip";
import { ArrowLeft, Download, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function GalleryPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
	const photos = useQuery(api.photos.list, { limit: 100 });
	const removePhoto = useMutation(api.photos.remove);

	type Photo = { _id: Id<"photos">; url: string | null; humanCode: string; createdAt: number };
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<Id<"photos"> | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/admin");
		}
	}, [isAuthenticated, authLoading, router]);

	if (authLoading || !isAuthenticated) {
		return null;
	}

	const handleExportAll = async () => {
		if (!photos?.items.length) return;

		setIsExporting(true);
		const zip = new JSZip();

		try {
			for (let i = 0; i < photos.items.length; i++) {
				const photo = photos.items[i];
				if (photo.url) {
					const response = await fetch(photo.url);
					const blob = await response.blob();
					const date = new Date(photo.createdAt).toISOString().split("T")[0];
					zip.file(`photocall_${date}_${photo.humanCode}.jpg`, blob);
				}
			}

			const content = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(content);
			const a = document.createElement("a");
			a.href = url;
			a.download = `photocall_export_${new Date().toISOString().split("T")[0]}.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsExporting(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteDialog) return;
		setIsDeleting(true);
		try {
			await removePhoto({ photoId: deleteDialog });
			setDeleteDialog(null);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDownload = async (url: string, humanCode: string) => {
		const response = await fetch(url);
		const blob = await response.blob();
		const blobUrl = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = blobUrl;
		a.download = `photocall_${humanCode}.jpg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(blobUrl);
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Header */}
			<header className="border-b bg-background">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<div className="flex items-center gap-4">
						<Link href="/admin/dashboard">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						</Link>
						<h1 className="text-xl font-bold">Photo Gallery</h1>
					</div>
					<Button onClick={handleExportAll} disabled={isExporting || !photos?.items.length}>
						{isExporting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Exporting...
							</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Export All ({photos?.items.length ?? 0})
							</>
						)}
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{!photos ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : photos.items.length === 0 ? (
					<Card>
						<CardContent className="py-20 text-center">
							<p className="text-muted-foreground">
								No photos yet. Start the kiosk to capture some memories!
							</p>
							<Link href="/kiosk" className="mt-4 inline-block">
								<Button>Launch Kiosk</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{photos.items.map((photo: Photo) => (
							<Card key={photo._id} className="group overflow-hidden">
								<button
									type="button"
									className="relative aspect-[3/4] w-full cursor-pointer border-0 bg-transparent p-0"
									onClick={() => setSelectedPhoto(photo)}
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={photo.url ?? ""}
										alt={`Captured moment ${photo.humanCode}`}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
								</button>
								<CardContent className="p-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-mono text-sm font-medium">{photo.humanCode}</p>
											<p className="text-xs text-muted-foreground">
												{new Date(photo.createdAt).toLocaleDateString()}
											</p>
										</div>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => photo.url && handleDownload(photo.url, photo.humanCode)}
											>
												<Download className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setDeleteDialog(photo._id)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>

			{/* Photo Detail Dialog */}
			<Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
				<DialogContent className="max-w-3xl">
					{selectedPhoto && (
						<>
							<DialogHeader>
								<DialogTitle>Photo {selectedPhoto.humanCode}</DialogTitle>
								<DialogDescription>
									Taken on {new Date(selectedPhoto.createdAt).toLocaleString()}
								</DialogDescription>
							</DialogHeader>
							<div className="relative aspect-[3/4] overflow-hidden rounded-lg">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={selectedPhoto.url ?? ""}
									alt={`Captured moment ${selectedPhoto.humanCode}`}
									className="h-full w-full object-contain"
								/>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() =>
										selectedPhoto.url && handleDownload(selectedPhoto.url, selectedPhoto.humanCode)
									}
								>
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
								<Button variant="destructive" onClick={() => setDeleteDialog(selectedPhoto._id)}>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Photo?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. The photo will be permanently deleted.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialog(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
