"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
	Camera,
	ChevronLeft,
	Loader2,
	Palette,
	Save,
	Settings,
	Share,
	Shield,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function EventSettingsPage() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const event = useQuery(api.events.getBySlug, {
		organizationSlug: orgSlug,
		eventSlug: eventSlug,
	});

	const updateEvent = useMutation(api.events.update);
	const setKioskPin = useMutation(api.events.setKioskPin);
	const removeEvent = useMutation(api.events.remove);

	const [isSaving, setIsSaving] = useState(false);
	const [newPin, setNewPin] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		welcomeMessage: "",
		thankYouMessage: "",
		primaryColor: "",
		slideshowEnabled: true,
		slideshowSafeMode: false,
		idleTimeoutSeconds: 120,
		defaultCamera: "user" as "user" | "environment",
		photoQuality: 0.9,
		maxPhotoDimension: 1920,
		allowDownload: true,
		allowPrint: true,
		showQrCode: true,
		shareExpirationDays: undefined as number | undefined,
		retentionDays: undefined as number | undefined,
	});

	useEffect(() => {
		if (event) {
			setFormData({
				name: event.name,
				description: event.description ?? "",
				welcomeMessage: event.welcomeMessage ?? "",
				thankYouMessage: event.thankYouMessage ?? "",
				primaryColor: event.primaryColor ?? "",
				slideshowEnabled: event.slideshowEnabled,
				slideshowSafeMode: event.slideshowSafeMode,
				idleTimeoutSeconds: event.idleTimeoutSeconds,
				defaultCamera: event.defaultCamera,
				photoQuality: event.photoQuality,
				maxPhotoDimension: event.maxPhotoDimension,
				allowDownload: event.allowDownload,
				allowPrint: event.allowPrint,
				showQrCode: event.showQrCode,
				shareExpirationDays: event.shareExpirationDays,
				retentionDays: event.retentionDays,
			});
		}
	}, [event]);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleSave = async () => {
		if (!event) return;
		setIsSaving(true);
		try {
			await updateEvent({
				id: event._id as Id<"events">,
				...formData,
			});
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSetPin = async () => {
		if (!event || newPin.length < 4) return;
		try {
			await setKioskPin({
				id: event._id as Id<"events">,
				pin: newPin,
			});
			setNewPin("");
		} catch (error) {
			console.error("Failed to set PIN:", error);
		}
	};

	const handleDelete = async () => {
		if (!event) return;
		if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
			return;
		}
		try {
			await removeEvent({ id: event._id as Id<"events"> });
			router.push(`/dashboard/${orgSlug}`);
		} catch (error) {
			console.error("Failed to delete:", error);
		}
	};

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
								<h1 className="font-bold text-xl">Event Settings</h1>
								<p className="text-sm text-muted-foreground">{event.name}</p>
							</div>
						</div>
						<Button onClick={handleSave} disabled={isSaving}>
							{isSaving ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				<Tabs defaultValue="general" className="space-y-6">
					<TabsList className="grid grid-cols-5 w-full">
						<TabsTrigger value="general">
							<Settings className="h-4 w-4 mr-2" />
							General
						</TabsTrigger>
						<TabsTrigger value="branding">
							<Palette className="h-4 w-4 mr-2" />
							Branding
						</TabsTrigger>
						<TabsTrigger value="camera">
							<Camera className="h-4 w-4 mr-2" />
							Camera
						</TabsTrigger>
						<TabsTrigger value="sharing">
							<Share className="h-4 w-4 mr-2" />
							Sharing
						</TabsTrigger>
						<TabsTrigger value="security">
							<Shield className="h-4 w-4 mr-2" />
							Security
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Event Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Optional description"
									className="mt-2"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Slideshow on Idle</Label>
									<p className="text-sm text-muted-foreground">
										Show recent photos when kiosk is idle
									</p>
								</div>
								<Switch
									checked={formData.slideshowEnabled}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, slideshowEnabled: checked })
									}
								/>
							</div>
							<div>
								<Label htmlFor="idle">Idle Timeout (seconds)</Label>
								<Input
									id="idle"
									type="number"
									value={formData.idleTimeoutSeconds}
									onChange={(e) =>
										setFormData({
											...formData,
											idleTimeoutSeconds: Number.parseInt(e.target.value, 10) || 120,
										})
									}
									className="mt-2"
									min={30}
									max={600}
								/>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="branding" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="welcome">Welcome Message</Label>
								<Input
									id="welcome"
									value={formData.welcomeMessage}
									onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
									placeholder="Tap to start!"
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="thanks">Thank You Message</Label>
								<Input
									id="thanks"
									value={formData.thankYouMessage}
									onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
									placeholder="Thanks for taking a photo!"
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="color">Primary Color</Label>
								<div className="flex gap-2 mt-2">
									<Input
										id="color"
										type="color"
										value={formData.primaryColor || "#000000"}
										onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
										className="w-16 h-10 p-1"
									/>
									<Input
										value={formData.primaryColor}
										onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
										placeholder="#000000"
										className="flex-1"
									/>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="camera" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label>Default Camera</Label>
								<Select
									value={formData.defaultCamera}
									onValueChange={(value: "user" | "environment") =>
										setFormData({ ...formData, defaultCamera: value })
									}
								>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">Front Camera</SelectItem>
										<SelectItem value="environment">Back Camera</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="quality">
									Photo Quality ({Math.round(formData.photoQuality * 100)}%)
								</Label>
								<input
									id="quality"
									type="range"
									min="0.5"
									max="1"
									step="0.1"
									value={formData.photoQuality}
									onChange={(e) =>
										setFormData({ ...formData, photoQuality: Number.parseFloat(e.target.value) })
									}
									className="mt-2 w-full"
								/>
							</div>
							<div>
								<Label htmlFor="dimension">Max Dimension (px)</Label>
								<Select
									value={formData.maxPhotoDimension.toString()}
									onValueChange={(value) =>
										setFormData({ ...formData, maxPhotoDimension: Number.parseInt(value, 10) })
									}
								>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1280">1280px (HD)</SelectItem>
										<SelectItem value="1920">1920px (Full HD)</SelectItem>
										<SelectItem value="2560">2560px (2K)</SelectItem>
										<SelectItem value="3840">3840px (4K)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="sharing" className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>Allow Download</Label>
									<p className="text-sm text-muted-foreground">Guests can download their photos</p>
								</div>
								<Switch
									checked={formData.allowDownload}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, allowDownload: checked })
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Allow Print</Label>
									<p className="text-sm text-muted-foreground">Guests can print their photos</p>
								</div>
								<Switch
									checked={formData.allowPrint}
									onCheckedChange={(checked) => setFormData({ ...formData, allowPrint: checked })}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Show QR Code</Label>
									<p className="text-sm text-muted-foreground">Display QR code for sharing</p>
								</div>
								<Switch
									checked={formData.showQrCode}
									onCheckedChange={(checked) => setFormData({ ...formData, showQrCode: checked })}
								/>
							</div>
							<div>
								<Label htmlFor="expiry">Share Link Expiry (days)</Label>
								<Input
									id="expiry"
									type="number"
									value={formData.shareExpirationDays ?? ""}
									onChange={(e) =>
										setFormData({
											...formData,
											shareExpirationDays: e.target.value
												? Number.parseInt(e.target.value, 10)
												: undefined,
										})
									}
									placeholder="Never expire"
									className="mt-2"
									min={1}
								/>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="security" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="pin">Kiosk Admin PIN</Label>
								<p className="text-sm text-muted-foreground mb-2">
									Set a PIN to access admin features from the kiosk
								</p>
								<div className="flex gap-2">
									<Input
										id="pin"
										type="password"
										value={newPin}
										onChange={(e) => setNewPin(e.target.value)}
										placeholder="Enter new PIN (min 4 digits)"
										minLength={4}
									/>
									<Button type="button" onClick={handleSetPin} disabled={newPin.length < 4}>
										Set PIN
									</Button>
								</div>
							</div>

							<div className="border-t pt-6 mt-8">
								<h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Permanently delete this event and all its data.
								</p>
								<Button variant="destructive" onClick={handleDelete}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Event
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
