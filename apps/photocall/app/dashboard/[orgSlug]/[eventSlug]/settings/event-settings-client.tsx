"use client";

import {
	Camera,
	ChevronLeft,
	Loader2,
	Palette,
	Printer,
	Save,
	Settings,
	Share,
	Shield,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { deleteEvent, getEventBySlug, setKioskPin, updateEvent } from "@/actions/events";
import { Badge } from "@/components/ui/badge";
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
import { enumerateCameras } from "@/hooks/use-camera";
import { useSession } from "@/lib/auth-client";
import type { Orientation, PaperSize } from "@/lib/layout/types";
import { type BridgePrinter, listBridgePrinters } from "@/lib/print/bridge-client";
import { executePrint } from "@/lib/print/index";
import type { EventPrintConfig, PrintMethod } from "@/lib/print/types";

export default function EventSettingsPage() {
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

	const [isSaving, setIsSaving] = useState(false);
	const [newPin, setNewPin] = useState("");
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
	const [camerasLoading, setCamerasLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		coupleNames: "",
		welcomeMessage: "",
		thankYouMessage: "",
		primaryColor: "",
		slideshowEnabled: true,
		slideshowSafeMode: false,
		idleTimeoutSeconds: 120,
		defaultCamera: "user" as "user" | "environment",
		cameraDeviceId: "" as string,
		cameraDeviceLabel: "" as string,
		captureDefaultCountdown: 3,
		captureAutoShoot: false,
		captureWhoChoosesFilter: "guest" as "guest" | "host",
		photoQuality: 0.9,
		maxPhotoDimension: 1920,
		allowDownload: true,
		allowPrint: true,
		showQrCode: true,
		shareExpirationDays: undefined as number | undefined,
		retentionDays: undefined as number | undefined,
		printMethod: "none" as PrintMethod,
		printBridgeUrl: "",
		printPrinterId: "",
		printPaperSize: "selphy_postcard" as PaperSize,
		printMediaType: "photo_glossy",
		printBorderless: true,
		printCopies: 1,
		printOrientation: "portrait" as Orientation,
		printAutoPrint: false,
	});

	// Print bridge "Test connection" state.
	const [bridgePrinters, setBridgePrinters] = useState<BridgePrinter[]>([]);
	const [bridgeTesting, setBridgeTesting] = useState(false);
	const [bridgeError, setBridgeError] = useState<string | null>(null);
	const [testPrinting, setTestPrinting] = useState(false);

	useEffect(() => {
		if (event) {
			setFormData({
				name: event.name,
				description: event.description ?? "",
				coupleNames: event.coupleNames ?? "",
				welcomeMessage: event.welcomeMessage ?? "",
				thankYouMessage: event.thankYouMessage ?? "",
				primaryColor: event.primaryColor ?? "",
				slideshowEnabled: event.slideshowEnabled,
				slideshowSafeMode: event.slideshowSafeMode,
				idleTimeoutSeconds: event.idleTimeoutSeconds,
				defaultCamera: (event.defaultCamera as "user" | "environment") ?? "user",
				cameraDeviceId: event.cameraDeviceId ?? "",
				cameraDeviceLabel: event.cameraDeviceLabel ?? "",
				captureDefaultCountdown: event.captureDefaultCountdown,
				captureAutoShoot: event.captureAutoShoot,
				captureWhoChoosesFilter: (event.captureWhoChoosesFilter as "guest" | "host") ?? "guest",
				photoQuality: event.photoQuality,
				maxPhotoDimension: event.maxPhotoDimension,
				allowDownload: event.allowDownload,
				allowPrint: event.allowPrint,
				showQrCode: event.showQrCode,
				shareExpirationDays: event.shareExpirationDays ?? undefined,
				retentionDays: event.retentionDays ?? undefined,
				printMethod: (event.printMethod as PrintMethod) ?? "none",
				printBridgeUrl: event.printBridgeUrl ?? "",
				printPrinterId: event.printPrinterId ?? "",
				printPaperSize: (event.printPaperSize as PaperSize | null) ?? "selphy_postcard",
				printMediaType: event.printMediaType ?? "photo_glossy",
				printBorderless: event.printBorderless,
				printCopies: event.printCopies,
				printOrientation: (event.printOrientation as Orientation) ?? "portrait",
				printAutoPrint: event.printAutoPrint,
			});
		}
	}, [event]);

	const refreshCameras = useCallback(async () => {
		setCamerasLoading(true);
		try {
			setCameras(await enumerateCameras());
		} catch (error) {
			console.error("Failed to enumerate cameras:", error);
		} finally {
			setCamerasLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleSave = async () => {
		if (!event) return;
		setIsSaving(true);
		try {
			await updateEvent(event.id, {
				...formData,
				cameraDeviceId: formData.cameraDeviceId || null,
				cameraDeviceLabel: formData.cameraDeviceLabel || null,
			});
			mutate((key) => Array.isArray(key) && key[0] === "events");
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const printConfig: EventPrintConfig = {
		printMethod: formData.printMethod,
		printBridgeUrl: formData.printBridgeUrl || null,
		printPrinterId: formData.printPrinterId || null,
		printPaperSize: formData.printPaperSize,
		printMediaType: formData.printMediaType || null,
		printBorderless: formData.printBorderless,
		printCopies: formData.printCopies,
		printOrientation: formData.printOrientation,
		printAutoPrint: formData.printAutoPrint,
	};

	const handleTestBridge = async () => {
		if (!formData.printBridgeUrl) return;
		setBridgeTesting(true);
		setBridgeError(null);
		try {
			const result = await listBridgePrinters(formData.printBridgeUrl);
			if (result.ok) {
				setBridgePrinters(result.printers);
				if (result.printers.length === 0) {
					setBridgeError("Bridge reachable, but no printers were discovered yet.");
				}
			} else {
				setBridgePrinters([]);
				setBridgeError(result.error);
			}
		} finally {
			setBridgeTesting(false);
		}
	};

	const handleTestPrint = async () => {
		setTestPrinting(true);
		try {
			// A small solid-color JPEG so operators can validate the full path.
			const canvas = document.createElement("canvas");
			canvas.width = 600;
			canvas.height = 900;
			const context = canvas.getContext("2d");
			if (context) {
				context.fillStyle = formData.primaryColor || "#e11d48";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = "#ffffff";
				context.font = "bold 48px system-ui, sans-serif";
				context.textAlign = "center";
				context.fillText("Test Print", canvas.width / 2, canvas.height / 2);
			}
			const blob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, "image/jpeg", 0.9),
			);
			if (blob) await executePrint(blob, printConfig);
		} catch (error) {
			console.error("Test print failed:", error);
		} finally {
			setTestPrinting(false);
		}
	};

	const selectedPrinter = bridgePrinters.find((p) => p.id === formData.printPrinterId);

	const handleSetPin = async () => {
		if (!event || newPin.length < 4) return;
		try {
			await setKioskPin(event.id, newPin);
			mutate((key) => Array.isArray(key) && key[0] === "events");
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
			await deleteEvent(event.id);
			mutate((key) => Array.isArray(key) && key[0] === "events");
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
					<TabsList className="grid grid-cols-6 w-full">
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
						<TabsTrigger value="print">
							<Printer className="h-4 w-4 mr-2" />
							Print
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
							<div>
								<Label htmlFor="coupleNames">Couple / Hosts</Label>
								<p className="text-sm text-muted-foreground">
									Shown on photobooth strips via the {"{coupleNames}"} token
								</p>
								<Input
									id="coupleNames"
									value={formData.coupleNames}
									onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
									placeholder="e.g. Alex & Sam"
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
								<p className="text-sm text-muted-foreground mt-2">
									Used when no specific capture device is selected below.
								</p>
							</div>
							<div>
								<div className="flex items-center justify-between">
									<Label>Capture Device</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={refreshCameras}
										disabled={camerasLoading}
									>
										{camerasLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
										Detect cameras
									</Button>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									Pick a specific webcam (e.g. a USB DSLR/capture device) for this kiosk.
								</p>
								<Select
									value={formData.cameraDeviceId || "default"}
									onValueChange={(value) => {
										if (value === "default") {
											setFormData({ ...formData, cameraDeviceId: "", cameraDeviceLabel: "" });
											return;
										}
										const device = cameras.find((c) => c.deviceId === value);
										setFormData({
											...formData,
											cameraDeviceId: value,
											cameraDeviceLabel: device?.label ?? "",
										});
									}}
								>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="System default" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">System default (use facing mode)</SelectItem>
										{formData.cameraDeviceId &&
											!cameras.some((c) => c.deviceId === formData.cameraDeviceId) && (
												<SelectItem value={formData.cameraDeviceId}>
													{formData.cameraDeviceLabel || "Saved device (not detected)"}
												</SelectItem>
											)}
										{cameras.map((camera, index) => (
											<SelectItem key={camera.deviceId} value={camera.deviceId}>
												{camera.label || `Camera ${index + 1}`}
											</SelectItem>
										))}
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

							<div className="border-t pt-6 mt-2 space-y-4">
								<h3 className="text-lg font-semibold">Photobooth Capture</h3>
								<div>
									<Label htmlFor="countdown">Countdown ({formData.captureDefaultCountdown}s)</Label>
									<input
										id="countdown"
										type="range"
										min="0"
										max="10"
										step="1"
										value={formData.captureDefaultCountdown}
										onChange={(e) =>
											setFormData({
												...formData,
												captureDefaultCountdown: Number.parseInt(e.target.value, 10),
											})
										}
										className="mt-2 w-full"
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label>Auto-shoot</Label>
										<p className="text-sm text-muted-foreground">
											Automatically chain shots instead of tapping for each one
										</p>
									</div>
									<Switch
										checked={formData.captureAutoShoot}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, captureAutoShoot: checked })
										}
									/>
								</div>
								<div>
									<Label>Who chooses the filter</Label>
									<Select
										value={formData.captureWhoChoosesFilter}
										onValueChange={(value: "guest" | "host") =>
											setFormData({ ...formData, captureWhoChoosesFilter: value })
										}
									>
										<SelectTrigger className="mt-2">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="guest">Guest picks at the booth</SelectItem>
											<SelectItem value="host">Host (use template filter only)</SelectItem>
										</SelectContent>
									</Select>
								</div>
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

					<TabsContent value="print" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label>Print Method</Label>
								<p className="text-sm text-muted-foreground mb-2">
									How composited strips are printed at the booth.
								</p>
								<Select
									value={formData.printMethod}
									onValueChange={(value: PrintMethod) =>
										setFormData({ ...formData, printMethod: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None (no printing)</SelectItem>
										<SelectItem value="manual">AirPrint (manual print dialog)</SelectItem>
										<SelectItem value="bridge">Auto bridge (silent network printing)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{formData.printMethod === "bridge" && (
								<div className="border-t pt-4 space-y-4">
									<div>
										<Label htmlFor="bridgeUrl">Print Bridge URL</Label>
										<p className="text-sm text-muted-foreground mb-2">
											Base URL of the print bridge on your network, e.g.
											http://raspberrypi.local:3200
										</p>
										<div className="flex gap-2">
											<Input
												id="bridgeUrl"
												value={formData.printBridgeUrl}
												onChange={(e) =>
													setFormData({ ...formData, printBridgeUrl: e.target.value })
												}
												placeholder="http://raspberrypi.local:3200"
												className="flex-1"
											/>
											<Button
												type="button"
												variant="outline"
												onClick={handleTestBridge}
												disabled={bridgeTesting || !formData.printBridgeUrl}
											>
												{bridgeTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
												Test connection
											</Button>
										</div>
										{bridgeError && <p className="text-sm text-amber-600 mt-2">{bridgeError}</p>}
									</div>

									<div>
										<Label>Printer</Label>
										<Select
											value={formData.printPrinterId || "none"}
											onValueChange={(value) =>
												setFormData({
													...formData,
													printPrinterId: value === "none" ? "" : value,
												})
											}
										>
											<SelectTrigger className="mt-2">
												<SelectValue placeholder="Select a printer" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">No printer selected</SelectItem>
												{formData.printPrinterId &&
													!bridgePrinters.some((p) => p.id === formData.printPrinterId) && (
														<SelectItem value={formData.printPrinterId}>
															{formData.printPrinterId} (saved)
														</SelectItem>
													)}
												{bridgePrinters.map((printer) => (
													<SelectItem key={printer.id} value={printer.id}>
														{printer.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{selectedPrinter && (
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<Badge variant={selectedPrinter.reachable ? "default" : "destructive"}>
													{selectedPrinter.reachable ? selectedPrinter.state : "unreachable"}
												</Badge>
												{selectedPrinter.markerNames.map((name, index) => (
													<Badge key={name} variant="outline">
														{name}: {selectedPrinter.markerLevels[index] ?? "?"}%
													</Badge>
												))}
											</div>
										)}
									</div>
								</div>
							)}

							{formData.printMethod !== "none" && (
								<div className="border-t pt-4 space-y-4">
									<div>
										<Label>Paper Size</Label>
										<Select
											value={formData.printPaperSize}
											onValueChange={(value: PaperSize) =>
												setFormData({ ...formData, printPaperSize: value })
											}
										>
											<SelectTrigger className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="selphy_postcard">SELPHY Postcard (100×148mm)</SelectItem>
												<SelectItem value="4x6">4×6 in</SelectItem>
												<SelectItem value="5x7">5×7 in</SelectItem>
												<SelectItem value="2x6_strip">2×6 in strip</SelectItem>
												<SelectItem value="6x8">6×8 in</SelectItem>
												<SelectItem value="a4">A4</SelectItem>
												<SelectItem value="letter">Letter</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Media Type</Label>
										<Select
											value={formData.printMediaType}
											onValueChange={(value) => setFormData({ ...formData, printMediaType: value })}
										>
											<SelectTrigger className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="photo_glossy">Glossy photo</SelectItem>
												<SelectItem value="photo_matte">Matte photo</SelectItem>
												<SelectItem value="photo_satin">Satin photo</SelectItem>
												<SelectItem value="photographic">Photographic</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label>Borderless</Label>
											<p className="text-sm text-muted-foreground">
												Print edge-to-edge with no white margin
											</p>
										</div>
										<Switch
											checked={formData.printBorderless}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, printBorderless: checked })
											}
										/>
									</div>

									<div>
										<Label htmlFor="copies">Copies</Label>
										<Input
											id="copies"
											type="number"
											value={formData.printCopies}
											onChange={(e) =>
												setFormData({
													...formData,
													printCopies: Math.max(
														1,
														Math.min(99, Number.parseInt(e.target.value, 10) || 1),
													),
												})
											}
											className="mt-2"
											min={1}
											max={99}
										/>
									</div>

									<div>
										<Label>Orientation</Label>
										<Select
											value={formData.printOrientation}
											onValueChange={(value: Orientation) =>
												setFormData({ ...formData, printOrientation: value })
											}
										>
											<SelectTrigger className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="portrait">Portrait</SelectItem>
												<SelectItem value="landscape">Landscape</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label>Auto-print</Label>
											<p className="text-sm text-muted-foreground">
												Print automatically once the photo is composed
											</p>
										</div>
										<Switch
											checked={formData.printAutoPrint}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, printAutoPrint: checked })
											}
										/>
									</div>

									<Button
										type="button"
										variant="outline"
										onClick={handleTestPrint}
										disabled={testPrinting}
									>
										{testPrinting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
										Test print
									</Button>
								</div>
							)}
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
