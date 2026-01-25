"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminAuth } from "@/hooks/use-admin-auth";

type Template = {
	_id: Id<"templates">;
	name: string;
	url: string | null;
	enabled: boolean;
	order: number;
};

export default function TemplatesPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
	const templates = useQuery(api.templates.list, {});
	const generateUploadUrl = useMutation(api.templates.generateUploadUrl);
	const createTemplate = useMutation(api.templates.create);
	const updateTemplate = useMutation(api.templates.update);
	const removeTemplate = useMutation(api.templates.remove);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [showUploadDialog, setShowUploadDialog] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<Id<"templates"> | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/admin");
		}
	}, [isAuthenticated, authLoading, router]);

	if (authLoading || !isAuthenticated) {
		return null;
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setNewTemplateName(file.name.replace(/\.[^/.]+$/, ""));
			setShowUploadDialog(true);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !newTemplateName) return;

		setIsUploading(true);
		try {
			// Get upload URL
			const uploadUrl = await generateUploadUrl();

			// Upload the file
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": selectedFile.type },
				body: selectedFile,
			});

			const { storageId } = await response.json();

			// Create the template
			await createTemplate({
				name: newTemplateName,
				storageId,
				safeArea: { x: 0.05, y: 0.05, width: 0.9, height: 0.75 },
				captionPosition: {
					x: 50,
					y: 850,
					maxWidth: 500,
					fontSize: 24,
					color: "#ffffff",
					align: "center",
				},
			});

			setShowUploadDialog(false);
			setSelectedFile(null);
			setNewTemplateName("");
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleToggleEnabled = async (templateId: Id<"templates">, enabled: boolean) => {
		await updateTemplate({ templateId, enabled });
	};

	const handleDelete = async () => {
		if (!deleteDialog) return;
		setIsDeleting(true);
		try {
			await removeTemplate({ templateId: deleteDialog });
			setDeleteDialog(null);
		} finally {
			setIsDeleting(false);
		}
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
						<h1 className="text-xl font-bold">Templates</h1>
					</div>
					<Button onClick={() => fileInputRef.current?.click()}>
						<Plus className="mr-2 h-4 w-4" />
						Add Template
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/png"
						className="hidden"
						onChange={handleFileSelect}
					/>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{!templates ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : templates.length === 0 ? (
					<Card>
						<CardContent className="py-20 text-center">
							<Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-2 text-lg font-medium">No templates yet</p>
							<p className="mb-4 text-muted-foreground">
								Upload PNG overlay images to create beautiful photo templates.
							</p>
							<Button onClick={() => fileInputRef.current?.click()}>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Template
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
						{templates.map((template: Template) => (
							<Card key={template._id} className={!template.enabled ? "opacity-60" : ""}>
								<div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={template.url ?? ""}
										alt={template.name}
										className="h-full w-full object-contain"
									/>
								</div>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">{template.name}</CardTitle>
									<CardDescription>Order: {template.order}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Switch
												checked={template.enabled}
												onCheckedChange={(checked) => handleToggleEnabled(template._id, checked)}
											/>
											<Label>{template.enabled ? "Enabled" : "Disabled"}</Label>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeleteDialog(template._id)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>

			{/* Upload Dialog */}
			<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Template</DialogTitle>
						<DialogDescription>
							Upload a PNG overlay image. The transparent areas will show the photo.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Template Name</Label>
							<Input
								value={newTemplateName}
								onChange={(e) => setNewTemplateName(e.target.value)}
								placeholder="My Wedding Frame"
							/>
						</div>
						{selectedFile && (
							<div className="rounded-lg border bg-muted p-4">
								<p className="text-sm">
									<strong>File:</strong> {selectedFile.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{(selectedFile.size / 1024).toFixed(1)} KB
								</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowUploadDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpload} disabled={isUploading || !newTemplateName}>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Upload
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Template?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. The template will be permanently deleted.
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
