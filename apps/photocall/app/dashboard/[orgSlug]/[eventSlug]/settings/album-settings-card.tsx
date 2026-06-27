"use client";

import { Check, Copy, ExternalLink, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
	listPendingGuestPhotos,
	moderateGuestPhoto,
	regenerateAlbumToken,
	updateAlbumSettings,
} from "@/actions/album";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { AlbumAccessMode, AlbumModeration } from "@/lib/db/schema";
import { generateQRCode } from "@/lib/qr";

type AlbumEvent = {
	id: string;
	albumEnabled: boolean;
	albumToken: string | null;
	albumAccessMode: string;
	allowGuestUpload: boolean;
	albumModeration: string;
};

const ACCESS_MODES: { value: AlbumAccessMode; label: string; help: string }[] = [
	{ value: "link", label: "Link / QR only", help: "Anyone with the link or QR can enter." },
	{ value: "link_pin", label: "Link + PIN", help: "Guests also enter a PIN you share." },
	{ value: "link_identity", label: "Link + name", help: "Guests enter their name first." },
];

export function AlbumSettingsCard({ event, onSaved }: { event: AlbumEvent; onSaved: () => void }) {
	const { toast } = useToast();
	const [enabled, setEnabled] = useState(event.albumEnabled);
	const [accessMode, setAccessMode] = useState<AlbumAccessMode>(
		event.albumAccessMode as AlbumAccessMode,
	);
	const [moderation, setModeration] = useState<AlbumModeration>(
		event.albumModeration as AlbumModeration,
	);
	const [allowUpload, setAllowUpload] = useState(event.allowGuestUpload);
	const [pin, setPin] = useState("");
	const [token, setToken] = useState(event.albumToken);
	const [qr, setQr] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [copied, setCopied] = useState(false);

	const albumUrl = token
		? `${typeof window !== "undefined" ? window.location.origin : ""}/a/${token}`
		: null;

	useEffect(() => {
		if (albumUrl)
			generateQRCode(albumUrl, 220)
				.then(setQr)
				.catch(() => setQr(null));
	}, [albumUrl]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const result = await updateAlbumSettings(event.id, {
				albumEnabled: enabled,
				albumAccessMode: accessMode,
				allowGuestUpload: allowUpload,
				albumModeration: moderation,
				pin: accessMode === "link_pin" && pin.trim() ? pin.trim() : undefined,
			});
			setToken(result.albumToken);
			setPin("");
			toast({ title: "Album settings saved" });
			onSaved();
		} catch (error) {
			toast({
				title: "Couldn't save",
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleRegenerate = async () => {
		if (!confirm("Generate a new link? The previous link and QR will stop working.")) return;
		const result = await regenerateAlbumToken(event.id);
		setToken(result.albumToken);
		toast({ title: "New album link generated" });
		onSaved();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Guest album</CardTitle>
				<CardDescription>
					A shareable gallery where guests view photobooth photos and add their own.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex items-center justify-between">
					<div>
						<Label>Enable guest album</Label>
						<p className="text-sm text-muted-foreground">
							Turn the public album on for this event.
						</p>
					</div>
					<Switch checked={enabled} onCheckedChange={setEnabled} />
				</div>

				{enabled && (
					<>
						<div className="space-y-2">
							<Label>Access</Label>
							<div className="grid gap-2">
								{ACCESS_MODES.map((mode) => (
									<label
										key={mode.value}
										className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-rose-400"
									>
										<input
											type="radio"
											name="album-access"
											className="mt-1"
											checked={accessMode === mode.value}
											onChange={() => setAccessMode(mode.value)}
										/>
										<div>
											<p className="font-medium">{mode.label}</p>
											<p className="text-sm text-muted-foreground">{mode.help}</p>
										</div>
									</label>
								))}
							</div>
						</div>

						{accessMode === "link_pin" && (
							<div>
								<Label htmlFor="album-pin">Album PIN</Label>
								<Input
									id="album-pin"
									value={pin}
									inputMode="numeric"
									onChange={(e) => setPin(e.target.value)}
									placeholder="Set or change the PIN"
									className="mt-2"
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									Leave blank to keep the current PIN.
								</p>
							</div>
						)}

						<div className="flex items-center justify-between">
							<div>
								<Label>Allow guest uploads</Label>
								<p className="text-sm text-muted-foreground">Let guests add their own photos.</p>
							</div>
							<Switch checked={allowUpload} onCheckedChange={setAllowUpload} />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Review uploads before they appear</Label>
								<p className="text-sm text-muted-foreground">
									Hold guest photos until you approve them.
								</p>
							</div>
							<Switch
								checked={moderation === "approval"}
								onCheckedChange={(checked) => setModeration(checked ? "approval" : "instant")}
							/>
						</div>
					</>
				)}

				<Button onClick={handleSave} disabled={saving}>
					{saving ? "Saving…" : "Save album settings"}
				</Button>

				{enabled && albumUrl && (
					<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
						<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
							{qr && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={qr} alt="Album QR code" className="h-32 w-32 rounded bg-white p-1" />
							)}
							<div className="min-w-0 flex-1 space-y-2">
								<Label>Album link</Label>
								<div className="flex gap-2">
									<Input readOnly value={albumUrl} className="font-mono text-sm" />
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											navigator.clipboard.writeText(albumUrl);
											setCopied(true);
											setTimeout(() => setCopied(false), 1500);
										}}
									>
										{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
									</Button>
									<Button variant="outline" size="icon" asChild>
										<a href={albumUrl} target="_blank" rel="noopener noreferrer">
											<ExternalLink className="h-4 w-4" />
										</a>
									</Button>
								</div>
								<Button variant="ghost" size="sm" className="gap-2" onClick={handleRegenerate}>
									<RefreshCw className="h-4 w-4" />
									Generate new link
								</Button>
							</div>
						</div>
					</div>
				)}

				{enabled && moderation === "approval" && <PendingUploads eventId={event.id} />}
			</CardContent>
		</Card>
	);
}

function PendingUploads({ eventId }: { eventId: string }) {
	const { toast } = useToast();
	const { data: pending, mutate } = useSWR(["album-pending", eventId], () =>
		listPendingGuestPhotos(eventId),
	);

	const moderate = async (photoId: string, action: "approve" | "hide") => {
		await moderateGuestPhoto(photoId, action);
		toast({ title: action === "approve" ? "Photo approved" : "Photo hidden" });
		mutate();
	};

	if (!pending || pending.length === 0) return null;

	return (
		<div className="space-y-3">
			<Label>Pending review ({pending.length})</Label>
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
				{pending.map((photo) => (
					<div key={photo.id} className="space-y-1">
						<div className="aspect-square overflow-hidden rounded-lg bg-muted">
							{photo.kind === "video" ? (
								<video
									src={photo.url}
									muted
									playsInline
									controls
									preload="metadata"
									className="h-full w-full object-cover"
								/>
							) : (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={photo.url} alt="" className="h-full w-full object-cover" />
							)}
						</div>
						<div className="flex gap-1">
							<Button
								size="sm"
								variant="outline"
								className="h-7 flex-1 px-0"
								onClick={() => moderate(photo.id, "approve")}
							>
								<Check className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 flex-1 px-0 text-destructive"
								onClick={() => moderate(photo.id, "hide")}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
