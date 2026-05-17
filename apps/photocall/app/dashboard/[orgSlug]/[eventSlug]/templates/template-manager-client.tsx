"use client";

import {
	ArrowDown,
	ArrowUp,
	ChevronLeft,
	Eye,
	EyeOff,
	GripVertical,
	Loader2,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getEventBySlug } from "@/actions/events";
import {
	createTemplate,
	deleteTemplate,
	generateTemplateUploadUrl,
	listTemplates,
	reorderTemplates,
	updateTemplate,
} from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";

export default function TemplateManager() {
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

	const { data: templates } = useSWR(event ? ["templates", event.id] : null, () =>
		listTemplates(event!.id),
	);

	const [isUploading, setIsUploading] = useState(false);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	if (authLoading || event === undefined || templates === undefined) {
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

	const handleMoveUp = async (index: number) => {
		if (!templates || index === 0) return;
		const ids = templates.map((t) => t.id);
		[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
		await reorderTemplates(event.id, ids);
		mutate((key) => Array.isArray(key) && key[0] === "templates");
	};

	const handleMoveDown = async (index: number) => {
		if (!templates || index === templates.length - 1) return;
		const ids = templates.map((t) => t.id);
		[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
		await reorderTemplates(event.id, ids);
		mutate((key) => Array.isArray(key) && key[0] === "templates");
	};

	const handleToggleEnabled = async (templateId: string, enabled: boolean) => {
		await updateTemplate(templateId, { enabled });
		mutate((key) => Array.isArray(key) && key[0] === "templates");
	};

	const handleDelete = async (templateId: string) => {
		if (!confirm("Delete this template? This cannot be undone.")) return;
		await deleteTemplate(templateId);
		mutate((key) => Array.isArray(key) && key[0] === "templates");
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link
								href={`/dashboard/${orgSlug}/${eventSlug}`}
								className="text-muted-foreground hover:text-foreground"
							>
								<ChevronLeft className="h-5 w-5" />
							</Link>
							<div>
								<h1 className="font-bold text-xl">Template Manager</h1>
								<p className="text-sm text-muted-foreground">{event.name}</p>
							</div>
						</div>
						<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Add Template
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-lg">
								<DialogHeader>
									<DialogTitle>Add Template</DialogTitle>
									<DialogDescription>
										Upload a PNG overlay for your photo booth frames.
									</DialogDescription>
								</DialogHeader>
								<UploadForm
									eventId={event.id}
									isUploading={isUploading}
									setIsUploading={setIsUploading}
									onComplete={() => {
										setShowAddDialog(false);
										mutate((key) => Array.isArray(key) && key[0] === "templates");
									}}
								/>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{templates.length === 0 ? (
					<div className="text-center py-16 border rounded-lg bg-muted/50">
						<Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">No templates yet</h2>
						<p className="text-muted-foreground mb-4">
							Upload PNG overlay images for your photo booth
						</p>
						<Button onClick={() => setShowAddDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Template
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{templates.map((template, index: number) => (
							<div
								key={template.id}
								className="flex items-center gap-4 p-4 border rounded-lg bg-card"
							>
								<GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />

								{/* Thumbnail */}
								<div className="w-16 h-20 rounded overflow-hidden bg-muted shrink-0">
									{(template.thumbnailUrl || template.url) && (
										<img
											src={template.thumbnailUrl || template.url || ""}
											alt={template.name}
											className="w-full h-full object-cover"
										/>
									)}
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									{editingTemplate === template.id ? (
										<EditForm
											template={template}
											onSave={async (updates) => {
												await updateTemplate(template.id, updates);
												mutate((key) => Array.isArray(key) && key[0] === "templates");
												setEditingTemplate(null);
											}}
											onCancel={() => setEditingTemplate(null)}
										/>
									) : (
										<>
											<button
												type="button"
												className="font-medium truncate text-left hover:underline"
												onClick={() => setEditingTemplate(template.id)}
											>
												{template.name}
											</button>
											<p className="text-sm text-muted-foreground">
												{template.enabled ? "Enabled" : "Disabled"}
												{template.captionPosition && " · Caption configured"}
												{template.safeArea && " · Safe area set"}
											</p>
										</>
									)}
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1 shrink-0">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleMoveUp(index)}
										disabled={index === 0}
									>
										<ArrowUp className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleMoveDown(index)}
										disabled={index === templates.length - 1}
									>
										<ArrowDown className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleToggleEnabled(template.id, !template.enabled)}
									>
										{template.enabled ? (
											<Eye className="h-4 w-4" />
										) : (
											<EyeOff className="h-4 w-4 text-muted-foreground" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(template.id)}
										className="text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function UploadForm({
	eventId,
	isUploading,
	setIsUploading,
	onComplete,
}: {
	eventId: string;
	isUploading: boolean;
	setIsUploading: (v: boolean) => void;
	onComplete: () => void;
}) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [captionEnabled, setCaptionEnabled] = useState(false);
	const [captionPosition, setCaptionPosition] = useState({
		x: 50,
		y: 90,
		maxWidth: 80,
		fontSize: 24,
		color: "#ffffff",
		align: "center" as "left" | "center" | "right",
	});
	const [safeAreaEnabled, setSafeAreaEnabled] = useState(false);
	const [safeArea, setSafeArea] = useState({ x: 10, y: 10, width: 80, height: 80 });

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) return;
		setFile(f);
		if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
		const url = URL.createObjectURL(f);
		setPreview(url);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file || !name.trim()) return;

		setIsUploading(true);
		try {
			const { uploadUrl, key } = await generateTemplateUploadUrl(eventId);
			const res = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!res.ok) throw new Error("Upload failed");

			await createTemplate({
				eventId,
				name: name.trim(),
				storageKey: key,
				captionPosition: captionEnabled
					? {
							...captionPosition,
							x: captionPosition.x / 100,
							y: captionPosition.y / 100,
							maxWidth: captionPosition.maxWidth / 100,
						}
					: undefined,
				safeArea: safeAreaEnabled
					? {
							x: safeArea.x / 100,
							y: safeArea.y / 100,
							width: safeArea.width / 100,
							height: safeArea.height / 100,
						}
					: undefined,
			});
			onComplete();
		} catch (err) {
			console.error("Upload failed:", err);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="file">Overlay Image (PNG)</Label>
				<Input
					ref={fileRef}
					id="file"
					type="file"
					accept="image/png"
					onChange={handleFileChange}
					className="mt-2"
				/>
			</div>

			{preview && (
				<div className="aspect-3/4 max-h-48 mx-auto rounded overflow-hidden bg-muted">
					<img src={preview} alt="Preview" className="w-full h-full object-contain" />
				</div>
			)}

			<div>
				<Label htmlFor="tpl-name">Template Name</Label>
				<Input
					id="tpl-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Floral Frame"
					className="mt-2"
				/>
			</div>

			<div className="space-y-3 border-t pt-4">
				<div className="flex items-center justify-between">
					<Label>Caption Position</Label>
					<Button
						type="button"
						variant={captionEnabled ? "default" : "outline"}
						size="sm"
						onClick={() => setCaptionEnabled(!captionEnabled)}
					>
						{captionEnabled ? "Enabled" : "Disabled"}
					</Button>
				</div>
				{captionEnabled && (
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<Label className="text-xs">X Position (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={captionPosition.x}
								onChange={(e) => setCaptionPosition({ ...captionPosition, x: +e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-xs">Y Position (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={captionPosition.y}
								onChange={(e) => setCaptionPosition({ ...captionPosition, y: +e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-xs">Max Width (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={captionPosition.maxWidth}
								onChange={(e) =>
									setCaptionPosition({ ...captionPosition, maxWidth: +e.target.value })
								}
							/>
						</div>
						<div>
							<Label className="text-xs">Font Size (px)</Label>
							<Input
								type="number"
								min={8}
								max={96}
								value={captionPosition.fontSize}
								onChange={(e) =>
									setCaptionPosition({ ...captionPosition, fontSize: +e.target.value })
								}
							/>
						</div>
						<div>
							<Label className="text-xs">Color</Label>
							<Input
								type="color"
								value={captionPosition.color}
								onChange={(e) => setCaptionPosition({ ...captionPosition, color: e.target.value })}
								className="h-9 p-1"
							/>
						</div>
						<div>
							<Label className="text-xs">Align</Label>
							<Select
								value={captionPosition.align}
								onValueChange={(v: "left" | "center" | "right") =>
									setCaptionPosition({ ...captionPosition, align: v })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="left">Left</SelectItem>
									<SelectItem value="center">Center</SelectItem>
									<SelectItem value="right">Right</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}
			</div>

			<div className="space-y-3 border-t pt-4">
				<div className="flex items-center justify-between">
					<Label>Safe Area (photo placement)</Label>
					<Button
						type="button"
						variant={safeAreaEnabled ? "default" : "outline"}
						size="sm"
						onClick={() => setSafeAreaEnabled(!safeAreaEnabled)}
					>
						{safeAreaEnabled ? "Enabled" : "Disabled"}
					</Button>
				</div>
				{safeAreaEnabled && (
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<Label className="text-xs">X (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={safeArea.x}
								onChange={(e) => setSafeArea({ ...safeArea, x: +e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-xs">Y (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={safeArea.y}
								onChange={(e) => setSafeArea({ ...safeArea, y: +e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-xs">Width (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={safeArea.width}
								onChange={(e) => setSafeArea({ ...safeArea, width: +e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-xs">Height (%)</Label>
							<Input
								type="number"
								min={0}
								max={100}
								value={safeArea.height}
								onChange={(e) => setSafeArea({ ...safeArea, height: +e.target.value })}
							/>
						</div>
					</div>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={!file || !name.trim() || isUploading}>
				{isUploading ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Uploading...
					</>
				) : (
					<>
						<Upload className="h-4 w-4 mr-2" />
						Upload Template
					</>
				)}
			</Button>
		</form>
	);
}

function EditForm({
	template,
	onSave,
	onCancel,
}: {
	template: {
		name: string;
		captionPosition?: {
			x: number;
			y: number;
			maxWidth: number;
			fontSize: number;
			color: string;
			align: "left" | "center" | "right";
		} | null;
		safeArea?: { x: number; y: number; width: number; height: number } | null;
	};
	onSave: (updates: { name: string }) => Promise<void>;
	onCancel: () => void;
}) {
	const [name, setName] = useState(template.name);
	const [saving, setSaving] = useState(false);

	const handleSave = useCallback(async () => {
		setSaving(true);
		await onSave({ name });
		setSaving(false);
	}, [name, onSave]);

	return (
		<div className="flex items-center gap-2">
			<Input
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="h-8"
				autoFocus
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSave();
					if (e.key === "Escape") onCancel();
				}}
			/>
			<Button size="sm" onClick={handleSave} disabled={saving}>
				{saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
			</Button>
			<Button size="sm" variant="ghost" onClick={onCancel}>
				Cancel
			</Button>
		</div>
	);
}
