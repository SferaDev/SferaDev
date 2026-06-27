"use client";

import { Camera, Download, ImagePlus, Link2, Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	type AlbumMeta,
	type AlbumPhoto,
	confirmGuestUpload,
	deleteOwnGuestPhoto,
	generateGuestUploadUrl,
	recordAlbumVisit,
} from "@/actions/album";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadBlob, resizeImageFile } from "@/lib/canvas-utils";

export function AlbumView({
	token,
	album,
	initialPhotos,
	canUpload,
}: {
	token: string;
	album: AlbumMeta;
	initialPhotos: AlbumPhoto[];
	canUpload: boolean;
	guestName: string | null;
}) {
	const router = useRouter();
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
	const [active, setActive] = useState<AlbumPhoto | null>(null);
	const [exporting, setExporting] = useState(false);

	const title = album.coupleNames || album.eventName;

	// Persist a grant so this album shows up under "your albums" on return.
	useEffect(() => {
		recordAlbumVisit(token).catch(() => {});
	}, [token]);

	const handleFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
		if (images.length === 0) return;

		setUploading({ done: 0, total: images.length });
		let failures = 0;

		for (const [index, file] of images.entries()) {
			try {
				const { blob, width, height } = await resizeImageFile(file);
				const { uploadUrl, key } = await generateGuestUploadUrl(token, "image/jpeg", blob.size);

				const put = await fetch(uploadUrl, {
					method: "PUT",
					body: blob,
					headers: { "Content-Type": "image/jpeg" },
				});
				if (!put.ok) throw new Error("Upload failed");

				await confirmGuestUpload(token, { key, width, height });
			} catch (error) {
				failures += 1;
				console.error("guest upload failed:", error);
			} finally {
				setUploading({ done: index + 1, total: images.length });
			}
		}

		setUploading(null);
		if (fileInputRef.current) fileInputRef.current.value = "";

		const uploaded = images.length - failures;
		if (uploaded > 0) {
			toast({
				title: "Photos added",
				description:
					failures > 0
						? `${uploaded} added, ${failures} failed.`
						: `Thanks! ${uploaded} ${uploaded === 1 ? "photo" : "photos"} added to the album.`,
			});
			router.refresh();
		} else {
			toast({
				title: "Upload failed",
				description: "We couldn't add those photos. Please try again.",
				variant: "destructive",
			});
		}
	};

	/**
	 * Trigger a download via a plain anchor click. The URL is a presigned link
	 * carrying `Content-Disposition: attachment`, so the browser downloads it
	 * directly from storage — cross-origin, no `fetch`, no CORS, and no lost
	 * user-gesture. (A cross-origin `download` attribute is ignored, hence relying
	 * on the header for the name, which is why the previous fetch+blob approach
	 * silently failed on mobile.)
	 */
	const handleDownload = (photo: AlbumPhoto) => {
		if (!photo.downloadUrl) return;
		const anchor = document.createElement("a");
		anchor.href = photo.downloadUrl;
		anchor.rel = "noopener";
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	};

	const handleExportAll = async () => {
		setExporting(true);
		try {
			const { default: JSZip } = await import("jszip");
			const zip = new JSZip();
			await Promise.all(
				initialPhotos.map(async (photo, index) => {
					const response = await fetch(photo.url);
					const blob = await response.blob();
					const ext = blob.type.split("/")[1] ?? "jpg";
					zip.file(`${String(index + 1).padStart(3, "0")}.${ext}`, blob);
				}),
			);
			const content = await zip.generateAsync({ type: "blob" });
			downloadBlob(content, `${album.eventName}-album.zip`);
		} catch {
			toast({ title: "Download failed", variant: "destructive" });
		} finally {
			setExporting(false);
		}
	};

	const handleDelete = async (photo: AlbumPhoto) => {
		const result = await deleteOwnGuestPhoto(token, photo.id);
		if (result.ok) {
			setActive(null);
			toast({ title: "Photo removed" });
			router.refresh();
		} else {
			toast({ title: "Couldn't remove photo", variant: "destructive" });
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
					<div className="flex items-center gap-2">
						{album.logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={album.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
						) : (
							<Camera className="h-6 w-6 text-rose-500" />
						)}
						<span className="text-lg font-bold">{title}</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2"
						onClick={() => {
							navigator.clipboard.writeText(window.location.href);
							toast({ title: "Link copied" });
						}}
					>
						<Link2 className="h-4 w-4" />
						<span className="hidden sm:inline">Share album</span>
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<p className="text-muted-foreground">
						{initialPhotos.length} {initialPhotos.length === 1 ? "photo" : "photos"}
					</p>
					<div className="flex flex-wrap gap-2">
						{album.allowDownload && initialPhotos.length > 0 && (
							<Button
								variant="outline"
								onClick={handleExportAll}
								disabled={exporting}
								className="gap-2"
							>
								{exporting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Download className="h-4 w-4" />
								)}
								Download all
							</Button>
						)}
						{canUpload && (
							<Button
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading !== null}
								className="gap-2"
							>
								{uploading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<ImagePlus className="h-4 w-4" />
								)}
								{uploading ? `Uploading ${uploading.done}/${uploading.total}` : "Add your photos"}
							</Button>
						)}
					</div>
				</div>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					className="hidden"
					onChange={(e) => handleFiles(e.target.files)}
				/>

				{initialPhotos.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
						<Camera className="h-12 w-12 text-muted-foreground" />
						<div>
							<p className="font-medium">No photos yet</p>
							<p className="text-sm text-muted-foreground">
								{canUpload ? "Be the first to add a memory." : "Check back soon."}
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{initialPhotos.map((photo) => (
							<button
								key={photo.id}
								type="button"
								onClick={() => setActive(photo)}
								className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={photo.url}
									alt={photo.caption ?? "Album photo"}
									loading="lazy"
									className="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
								{photo.status === "pending" && (
									<span className="absolute left-1 top-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-xs font-medium text-white">
										Pending
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</main>

			<Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
				<DialogContent className="max-w-3xl gap-3 p-2 sm:p-4">
					<DialogTitle className="sr-only">Photo</DialogTitle>
					{active && (
						<>
							<div className="flex max-h-[70vh] items-center justify-center bg-muted">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={active.url}
									alt={active.caption ?? "Album photo"}
									className="max-h-[70vh] w-auto object-contain"
								/>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-2 px-1">
								<div className="text-sm text-muted-foreground">
									{active.uploaderName ? `Shared by ${active.uploaderName}` : null}
								</div>
								<div className="flex gap-2">
									{album.allowDownload && (
										<Button
											size="sm"
											variant="outline"
											className="gap-2"
											onClick={() => handleDownload(active)}
										>
											<Download className="h-4 w-4" />
											Download
										</Button>
									)}
									{active.mine && (
										<Button
											size="sm"
											variant="ghost"
											className="gap-2 text-destructive"
											onClick={() => handleDelete(active)}
										>
											<Trash2 className="h-4 w-4" />
											Remove
										</Button>
									)}
									<Button size="sm" variant="ghost" onClick={() => setActive(null)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
