"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
	const settings = useQuery(api.settings.get);
	const updateSettings = useMutation(api.settings.update);
	const changePin = useMutation(api.settings.changePin);

	const [isSaving, setIsSaving] = useState(false);
	const [isChangingPin, setIsChangingPin] = useState(false);
	const [currentPin, setCurrentPin] = useState("");
	const [newPin, setNewPin] = useState("");
	const [confirmPin, setConfirmPin] = useState("");

	// Local state for settings
	const [slideshowEnabled, setSlideshowEnabled] = useState(true);
	const [slideshowSafeMode, setSlideshowSafeMode] = useState(false);
	const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(60);
	const [defaultCamera, setDefaultCamera] = useState<"user" | "environment">("user");
	const [photoQuality, setPhotoQuality] = useState(90);
	const [maxPhotoDimension, setMaxPhotoDimension] = useState(2048);

	// Sync settings when loaded
	useEffect(() => {
		if (settings) {
			setSlideshowEnabled(settings.slideshowEnabled);
			setSlideshowSafeMode(settings.slideshowSafeMode);
			setIdleTimeoutSeconds(settings.idleTimeoutSeconds);
			setDefaultCamera(settings.defaultCamera);
			setPhotoQuality(Math.round(settings.photoQuality * 100));
			setMaxPhotoDimension(settings.maxPhotoDimension);
		}
	}, [settings]);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/admin");
		}
	}, [isAuthenticated, authLoading, router]);

	if (authLoading || !isAuthenticated || !settings) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const handleSaveSettings = async () => {
		setIsSaving(true);
		try {
			await updateSettings({
				slideshowEnabled,
				slideshowSafeMode,
				idleTimeoutSeconds,
				defaultCamera,
				photoQuality: photoQuality / 100,
				maxPhotoDimension,
			});
			toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
		} catch {
			toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
		} finally {
			setIsSaving(false);
		}
	};

	const handleChangePin = async () => {
		if (newPin !== confirmPin) {
			toast({ title: "Error", description: "PINs do not match.", variant: "destructive" });
			return;
		}
		if (newPin.length < 4) {
			toast({
				title: "Error",
				description: "PIN must be at least 4 digits.",
				variant: "destructive",
			});
			return;
		}

		setIsChangingPin(true);
		try {
			await changePin({ currentPin, newPin });
			toast({ title: "PIN changed", description: "Your admin PIN has been updated." });
			setCurrentPin("");
			setNewPin("");
			setConfirmPin("");
		} catch {
			toast({ title: "Error", description: "Invalid current PIN.", variant: "destructive" });
		} finally {
			setIsChangingPin(false);
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
						<h1 className="text-xl font-bold">Settings</h1>
					</div>
				</div>
			</header>

			<main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
				{/* Kiosk Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Kiosk Behavior</CardTitle>
						<CardDescription>Configure how the kiosk operates</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<Label>Slideshow on Attract Screen</Label>
								<p className="text-sm text-muted-foreground">
									Show recent photos on the idle screen
								</p>
							</div>
							<Switch checked={slideshowEnabled} onCheckedChange={setSlideshowEnabled} />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Safe Mode (Blur Photos)</Label>
								<p className="text-sm text-muted-foreground">
									Blur photos in slideshow for privacy
								</p>
							</div>
							<Switch checked={slideshowSafeMode} onCheckedChange={setSlideshowSafeMode} />
						</div>

						<div className="space-y-2">
							<Label>Idle Timeout (seconds)</Label>
							<Input
								type="number"
								value={idleTimeoutSeconds}
								onChange={(e) => setIdleTimeoutSeconds(Number.parseInt(e.target.value, 10) || 60)}
								min={10}
								max={300}
							/>
							<p className="text-sm text-muted-foreground">
								Return to attract screen after this many seconds of inactivity
							</p>
						</div>

						<div className="space-y-2">
							<Label>Default Camera</Label>
							<div className="flex gap-4">
								<Button
									variant={defaultCamera === "user" ? "default" : "outline"}
									onClick={() => setDefaultCamera("user")}
								>
									Front Camera
								</Button>
								<Button
									variant={defaultCamera === "environment" ? "default" : "outline"}
									onClick={() => setDefaultCamera("environment")}
								>
									Back Camera
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Photo Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Photo Settings</CardTitle>
						<CardDescription>Configure photo quality and size</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label>JPEG Quality ({photoQuality}%)</Label>
							<Input
								type="range"
								value={photoQuality}
								onChange={(e) => setPhotoQuality(Number.parseInt(e.target.value, 10))}
								min={50}
								max={100}
								className="w-full"
							/>
						</div>

						<div className="space-y-2">
							<Label>Max Photo Dimension (pixels)</Label>
							<Input
								type="number"
								value={maxPhotoDimension}
								onChange={(e) => setMaxPhotoDimension(Number.parseInt(e.target.value, 10) || 2048)}
								min={800}
								max={4096}
							/>
							<p className="text-sm text-muted-foreground">
								Longer edge will be limited to this size
							</p>
						</div>

						<Button onClick={handleSaveSettings} disabled={isSaving}>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Settings
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Change PIN */}
				<Card>
					<CardHeader>
						<CardTitle>Change Admin PIN</CardTitle>
						<CardDescription>Update your admin access PIN</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Current PIN</Label>
							<Input
								type="password"
								inputMode="numeric"
								value={currentPin}
								onChange={(e) => setCurrentPin(e.target.value)}
								placeholder="Enter current PIN"
							/>
						</div>
						<div className="space-y-2">
							<Label>New PIN</Label>
							<Input
								type="password"
								inputMode="numeric"
								value={newPin}
								onChange={(e) => setNewPin(e.target.value)}
								placeholder="Enter new PIN"
							/>
						</div>
						<div className="space-y-2">
							<Label>Confirm New PIN</Label>
							<Input
								type="password"
								inputMode="numeric"
								value={confirmPin}
								onChange={(e) => setConfirmPin(e.target.value)}
								placeholder="Confirm new PIN"
							/>
						</div>
						<Button
							onClick={handleChangePin}
							disabled={isChangingPin || !currentPin || !newPin || !confirmPin}
							variant="outline"
						>
							{isChangingPin ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Changing...
								</>
							) : (
								"Change PIN"
							)}
						</Button>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
