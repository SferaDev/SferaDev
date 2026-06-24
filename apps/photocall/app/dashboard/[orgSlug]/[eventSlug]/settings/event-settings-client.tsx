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
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
	deleteEvent,
	generateEventLogoUploadUrl,
	getEventBySlug,
	setKioskPin,
	updateEvent,
} from "@/actions/events";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { enumerateCameras } from "@/hooks/use-camera";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";
import { BUNDLED_FONTS } from "@/lib/compose/fonts";
import type { Orientation, PaperSize } from "@/lib/layout/types";
import { type BridgePrinter, listBridgePrinters } from "@/lib/print/bridge-client";
import { executePrint } from "@/lib/print/index";
import type { EventPrintConfig, PrintMethod } from "@/lib/print/types";
import { AlbumSettingsCard } from "./album-settings-card";

export default function EventSettingsPage() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const { mutate } = useSWRConfig();
	const t = useTranslations("dashboard.eventSettings");
	const tc = useTranslations("dashboard.common");
	const te = useTranslations("dashboard.events");
	const { toast } = useToast();

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
		// Kiosk chrome overrides (empty string → cleared → kiosk i18n default).
		attractTitle: "",
		attractSubtitle: "",
		ctaLabel: "",
		consentText: "",
		skipConsent: false,
		accentColor: "",
		fontFamily: "",
		showPoweredBy: true,
		logoStorageKey: "" as string,
		slideshowEnabled: true,
		slideshowSafeMode: false,
		idleTimeoutSeconds: 120,
		defaultCamera: "user" as "user" | "environment",
		cameraDeviceId: "" as string,
		cameraDeviceLabel: "" as string,
		captureDefaultCountdown: 3,
		captureAutoShoot: false,
		captureAutoStart: true,
		captureWhoChoosesFilter: "guest" as "guest" | "host",
		boomerangEnabled: false,
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

	// Logo upload state.
	const [logoUploading, setLogoUploading] = useState(false);
	const [logoError, setLogoError] = useState<string | null>(null);

	useEffect(() => {
		if (event) {
			setFormData({
				name: event.name,
				description: event.description ?? "",
				coupleNames: event.coupleNames ?? "",
				welcomeMessage: event.welcomeMessage ?? "",
				thankYouMessage: event.thankYouMessage ?? "",
				primaryColor: event.primaryColor ?? "",
				attractTitle: event.attractTitle ?? "",
				attractSubtitle: event.attractSubtitle ?? "",
				ctaLabel: event.ctaLabel ?? "",
				consentText: event.consentText ?? "",
				skipConsent: event.skipConsent,
				accentColor: event.accentColor ?? "",
				fontFamily: event.fontFamily ?? "",
				showPoweredBy: event.showPoweredBy,
				logoStorageKey: event.logoStorageKey ?? "",
				slideshowEnabled: event.slideshowEnabled,
				slideshowSafeMode: event.slideshowSafeMode,
				idleTimeoutSeconds: event.idleTimeoutSeconds,
				defaultCamera: (event.defaultCamera as "user" | "environment") ?? "user",
				cameraDeviceId: event.cameraDeviceId ?? "",
				cameraDeviceLabel: event.cameraDeviceLabel ?? "",
				captureDefaultCountdown: event.captureDefaultCountdown,
				captureAutoShoot: event.captureAutoShoot,
				captureAutoStart: event.captureAutoStart,
				captureWhoChoosesFilter: (event.captureWhoChoosesFilter as "guest" | "host") ?? "guest",
				boomerangEnabled: event.boomerangEnabled,
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
				logoStorageKey: formData.logoStorageKey || null,
				// Empty kiosk overrides are stored as null so the kiosk falls back to
				// its i18n default rather than rendering an empty string.
				primaryColor: formData.primaryColor || null,
				attractTitle: formData.attractTitle || null,
				attractSubtitle: formData.attractSubtitle || null,
				ctaLabel: formData.ctaLabel || null,
				consentText: formData.consentText || null,
				accentColor: formData.accentColor || null,
				fontFamily: formData.fontFamily || null,
				// Cleared (undefined) means "no limit": persist null so the column is
				// actually reset rather than left at its previous value.
				shareExpirationDays: formData.shareExpirationDays ?? null,
				retentionDays: formData.retentionDays ?? null,
			});
			mutate((key) => Array.isArray(key) && key[0] === "events");
			toast({ title: t("saved") });
		} catch (error) {
			toast({
				title: t("couldNotSave"),
				description: error instanceof Error ? error.message : tc("unknownError"),
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleLogoUpload = async (file: File) => {
		if (!event) return;
		setLogoUploading(true);
		setLogoError(null);
		try {
			const { uploadUrl, storageKey } = await generateEventLogoUploadUrl(event.id, file.type);
			const response = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!response.ok) {
				throw new Error(`Upload failed (${response.status})`);
			}
			// Persist immediately so the kiosk picks up the new logo without waiting
			// for the operator to also press "Save Changes".
			await updateEvent(event.id, { logoStorageKey: storageKey });
			setFormData((prev) => ({ ...prev, logoStorageKey: storageKey }));
			mutate((key) => Array.isArray(key) && key[0] === "events");
		} catch (error) {
			console.error("Failed to upload logo:", error);
			setLogoError(error instanceof Error ? error.message : t("branding.failedToUploadLogo"));
		} finally {
			setLogoUploading(false);
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
					setBridgeError(t("print.bridgeReachableNoPrinters"));
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
				context.fillStyle = formData.primaryColor || DEFAULT_BRAND_COLOR;
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = "#ffffff";
				context.font = "bold 48px system-ui, sans-serif";
				context.textAlign = "center";
				context.fillText(t("print.testPrintLabel"), canvas.width / 2, canvas.height / 2);
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
		if (!confirm(t("security.confirmDeleteEvent"))) {
			return;
		}
		try {
			await deleteEvent(event.id);
			// Deleting changes the org event count, so refresh usage stats too.
			mutate((key) => Array.isArray(key) && (key[0] === "events" || key[0] === "usage"));
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
					<h1 className="text-2xl font-bold mb-2">{te("notFoundTitle")}</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{tc("backToOrganization")}
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
								<h1 className="font-bold text-xl">{t("title")}</h1>
								<p className="text-sm text-muted-foreground">{event.name}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<DashboardLanguagePicker />
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Save className="h-4 w-4 mr-2" />
								)}
								{tc("saveChanges")}
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				<Tabs defaultValue="general" className="space-y-6">
					<TabsList className="grid grid-cols-6 w-full">
						<TabsTrigger value="general">
							<Settings className="h-4 w-4 mr-2" />
							{t("tabs.general")}
						</TabsTrigger>
						<TabsTrigger value="branding">
							<Palette className="h-4 w-4 mr-2" />
							{t("tabs.branding")}
						</TabsTrigger>
						<TabsTrigger value="camera">
							<Camera className="h-4 w-4 mr-2" />
							{t("tabs.camera")}
						</TabsTrigger>
						<TabsTrigger value="sharing">
							<Share className="h-4 w-4 mr-2" />
							{t("tabs.sharing")}
						</TabsTrigger>
						<TabsTrigger value="print">
							<Printer className="h-4 w-4 mr-2" />
							{t("tabs.print")}
						</TabsTrigger>
						<TabsTrigger value="security">
							<Shield className="h-4 w-4 mr-2" />
							{t("tabs.security")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">{t("general.eventName")}</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="description">{t("general.description")}</Label>
								<Input
									id="description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder={t("general.descriptionPlaceholder")}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="coupleNames">{t("general.coupleHosts")}</Label>
								<p className="text-sm text-muted-foreground">
									{t("general.coupleHostsHelp", { token: "{coupleNames}" })}
								</p>
								<Input
									id="coupleNames"
									value={formData.coupleNames}
									onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
									placeholder={t("general.coupleHostsPlaceholder")}
									className="mt-2"
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>{t("general.slideshowOnIdle")}</Label>
									<p className="text-sm text-muted-foreground">
										{t("general.slideshowOnIdleHelp")}
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
								<Label htmlFor="idle">{t("general.idleTimeout")}</Label>
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
								<Label htmlFor="welcome">{t("branding.welcomeMessage")}</Label>
								<Input
									id="welcome"
									value={formData.welcomeMessage}
									onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
									placeholder={t("branding.welcomeMessagePlaceholder")}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="thanks">{t("branding.thankYouMessage")}</Label>
								<Input
									id="thanks"
									value={formData.thankYouMessage}
									onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
									placeholder={t("branding.thankYouMessagePlaceholder")}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="color">{t("branding.primaryColor")}</Label>
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
							<div>
								<Label htmlFor="accentColor">{t("branding.accentColor")}</Label>
								<p className="text-sm text-muted-foreground">{t("branding.accentColorHelp")}</p>
								<div className="flex gap-2 mt-2">
									<Input
										id="accentColor"
										type="color"
										value={formData.accentColor || "#000000"}
										onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
										className="w-16 h-10 p-1"
									/>
									<Input
										value={formData.accentColor}
										onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
										placeholder={t("branding.sameAsPrimary")}
										className="flex-1"
									/>
									{formData.accentColor ? (
										<Button
											type="button"
											variant="outline"
											onClick={() => setFormData({ ...formData, accentColor: "" })}
										>
											{t("branding.clear")}
										</Button>
									) : null}
								</div>
							</div>
						</div>

						<div className="border-t pt-6 space-y-4">
							<div>
								<h3 className="text-lg font-semibold">{t("branding.kioskLogo")}</h3>
								<p className="text-sm text-muted-foreground">{t("branding.kioskLogoHelp")}</p>
							</div>
							{event.logoUrl ? (
								<img
									src={event.logoUrl}
									alt={t("branding.logoAlt")}
									className="h-20 w-auto rounded border bg-muted object-contain p-2"
								/>
							) : (
								<p className="text-sm text-muted-foreground">{t("branding.noLogo")}</p>
							)}
							<div className="flex flex-wrap items-center gap-2">
								<input
									id="logo-upload"
									type="file"
									accept="image/png,image/jpeg,image/svg+xml,image/webp"
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) void handleLogoUpload(file);
										e.target.value = "";
									}}
								/>
								<Button
									type="button"
									variant="outline"
									disabled={logoUploading}
									onClick={() => document.getElementById("logo-upload")?.click()}
								>
									{logoUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
									{event.logoUrl ? t("branding.replaceLogo") : t("branding.uploadLogo")}
								</Button>
								{event.logoUrl ? (
									<Button
										type="button"
										variant="ghost"
										disabled={logoUploading}
										onClick={async () => {
											setFormData((prev) => ({ ...prev, logoStorageKey: "" }));
											await updateEvent(event.id, { logoStorageKey: null });
											mutate((key) => Array.isArray(key) && key[0] === "events");
										}}
									>
										{tc("remove")}
									</Button>
								) : null}
							</div>
							{logoError ? <p className="text-sm text-destructive">{logoError}</p> : null}
						</div>

						<div className="border-t pt-6 space-y-4">
							<div>
								<h3 className="text-lg font-semibold">{t("branding.kioskTextFont")}</h3>
								<p className="text-sm text-muted-foreground">{t("branding.kioskTextFontHelp")}</p>
							</div>
							<div>
								<Label>{t("branding.displayFont")}</Label>
								<Select
									value={formData.fontFamily || "system"}
									onValueChange={(value) =>
										setFormData({ ...formData, fontFamily: value === "system" ? "" : value })
									}
								>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="system">{t("branding.systemDefault")}</SelectItem>
										{Object.keys(BUNDLED_FONTS).map((family) => (
											<SelectItem key={family} value={family}>
												{family}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground mt-1">
									{t("branding.displayFontHelp")}
								</p>
							</div>
							<div>
								<Label htmlFor="attractTitle">{t("branding.attractTitle")}</Label>
								<p className="text-sm text-muted-foreground">{t("branding.attractTitleHelp")}</p>
								<Input
									id="attractTitle"
									value={formData.attractTitle}
									onChange={(e) => setFormData({ ...formData, attractTitle: e.target.value })}
									placeholder={formData.coupleNames || formData.name}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="attractSubtitle">{t("branding.attractSubtitle")}</Label>
								<Input
									id="attractSubtitle"
									value={formData.attractSubtitle}
									onChange={(e) => setFormData({ ...formData, attractSubtitle: e.target.value })}
									placeholder={t("branding.attractSubtitlePlaceholder")}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="ctaLabel">{t("branding.startButtonLabel")}</Label>
								<Input
									id="ctaLabel"
									value={formData.ctaLabel}
									onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
									placeholder={t("branding.startButtonPlaceholder")}
									className="mt-2"
								/>
							</div>
							<div>
								<Label htmlFor="consentText">{t("branding.consentText")}</Label>
								<Textarea
									id="consentText"
									value={formData.consentText}
									onChange={(e) => setFormData({ ...formData, consentText: e.target.value })}
									placeholder={t("branding.consentTextPlaceholder")}
									className="mt-2"
									rows={4}
									disabled={formData.skipConsent}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>{t("branding.skipConsent")}</Label>
									<p className="text-sm text-muted-foreground">{t("branding.skipConsentHelp")}</p>
								</div>
								<Switch
									checked={formData.skipConsent}
									onCheckedChange={(checked) => setFormData({ ...formData, skipConsent: checked })}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>{t("branding.showPoweredBy")}</Label>
									<p className="text-sm text-muted-foreground">{t("branding.showPoweredByHelp")}</p>
								</div>
								<Switch
									checked={formData.showPoweredBy}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, showPoweredBy: checked })
									}
								/>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="camera" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label>{t("camera.defaultCamera")}</Label>
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
										<SelectItem value="user">{t("camera.frontCamera")}</SelectItem>
										<SelectItem value="environment">{t("camera.backCamera")}</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground mt-2">
									{t("camera.defaultCameraHelp")}
								</p>
							</div>
							<div>
								<div className="flex items-center justify-between">
									<Label>{t("camera.captureDevice")}</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={refreshCameras}
										disabled={camerasLoading}
									>
										{camerasLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
										{t("camera.detectCameras")}
									</Button>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{t("camera.captureDeviceHelp")}
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
										<SelectValue placeholder={t("camera.systemDefault")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">{t("camera.systemDefaultFacingMode")}</SelectItem>
										{formData.cameraDeviceId &&
											!cameras.some((c) => c.deviceId === formData.cameraDeviceId) && (
												<SelectItem value={formData.cameraDeviceId}>
													{formData.cameraDeviceLabel || t("camera.savedDeviceNotDetected")}
												</SelectItem>
											)}
										{cameras.map((camera, index) => (
											<SelectItem key={camera.deviceId} value={camera.deviceId}>
												{camera.label || t("camera.cameraN", { n: index + 1 })}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="quality">
									{t("camera.photoQuality", { percent: Math.round(formData.photoQuality * 100) })}
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
								<Label htmlFor="dimension">{t("camera.maxDimension")}</Label>
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
										<SelectItem value="1280">{t("camera.dimensionHd")}</SelectItem>
										<SelectItem value="1920">{t("camera.dimensionFullHd")}</SelectItem>
										<SelectItem value="2560">{t("camera.dimension2k")}</SelectItem>
										<SelectItem value="3840">{t("camera.dimension4k")}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="border-t pt-6 mt-2 space-y-4">
								<h3 className="text-lg font-semibold">{t("camera.photoboothCapture")}</h3>
								<div>
									<Label htmlFor="countdown">
										{t("camera.countdown", { seconds: formData.captureDefaultCountdown })}
									</Label>
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
										<Label>{t("camera.autoStart")}</Label>
										<p className="text-sm text-muted-foreground">{t("camera.autoStartHelp")}</p>
									</div>
									<Switch
										checked={formData.captureAutoStart}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, captureAutoStart: checked })
										}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label>{t("camera.autoShoot")}</Label>
										<p className="text-sm text-muted-foreground">{t("camera.autoShootHelp")}</p>
									</div>
									<Switch
										checked={formData.captureAutoShoot}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, captureAutoShoot: checked })
										}
									/>
								</div>
								<div>
									<Label>{t("camera.whoChoosesFilter")}</Label>
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
											<SelectItem value="guest">{t("camera.guestPicks")}</SelectItem>
											<SelectItem value="host">{t("camera.hostPicks")}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label>{t("camera.boomerangMode")}</Label>
										<p className="text-sm text-muted-foreground">{t("camera.boomerangModeHelp")}</p>
									</div>
									<Switch
										checked={formData.boomerangEnabled}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, boomerangEnabled: checked })
										}
									/>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="sharing" className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>{t("sharing.allowDownload")}</Label>
									<p className="text-sm text-muted-foreground">{t("sharing.allowDownloadHelp")}</p>
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
									<Label>{t("sharing.allowPrint")}</Label>
									<p className="text-sm text-muted-foreground">{t("sharing.allowPrintHelp")}</p>
								</div>
								<Switch
									checked={formData.allowPrint}
									onCheckedChange={(checked) => setFormData({ ...formData, allowPrint: checked })}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>{t("sharing.showQrCode")}</Label>
									<p className="text-sm text-muted-foreground">{t("sharing.showQrCodeHelp")}</p>
								</div>
								<Switch
									checked={formData.showQrCode}
									onCheckedChange={(checked) => setFormData({ ...formData, showQrCode: checked })}
								/>
							</div>
							<div>
								<Label htmlFor="expiry">{t("sharing.shareLinkExpiry")}</Label>
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
									placeholder={t("sharing.neverExpire")}
									className="mt-2"
									min={1}
								/>
							</div>
						</div>

						<AlbumSettingsCard
							event={event}
							onSaved={() => mutate(["events", orgSlug, eventSlug])}
						/>
					</TabsContent>

					<TabsContent value="print" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label>{t("print.printMethod")}</Label>
								<p className="text-sm text-muted-foreground mb-2">{t("print.printMethodHelp")}</p>
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
										<SelectItem value="none">{t("print.methodNone")}</SelectItem>
										<SelectItem value="manual">{t("print.methodManual")}</SelectItem>
										<SelectItem value="bridge">{t("print.methodBridge")}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{formData.printMethod === "bridge" && (
								<div className="border-t pt-4 space-y-4">
									<div>
										<Label htmlFor="bridgeUrl">{t("print.printBridgeUrl")}</Label>
										<p className="text-sm text-muted-foreground mb-2">
											{t("print.printBridgeUrlHelp")}
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
												{t("print.testConnection")}
											</Button>
										</div>
										{bridgeError && <p className="text-sm text-amber-600 mt-2">{bridgeError}</p>}
									</div>

									<div>
										<Label>{t("print.printer")}</Label>
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
												<SelectValue placeholder={t("print.selectPrinter")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">{t("print.noPrinterSelected")}</SelectItem>
												{formData.printPrinterId &&
													!bridgePrinters.some((p) => p.id === formData.printPrinterId) && (
														<SelectItem value={formData.printPrinterId}>
															{t("print.printerSaved", { id: formData.printPrinterId })}
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
													{selectedPrinter.reachable
														? selectedPrinter.state
														: t("print.unreachable")}
												</Badge>
												{selectedPrinter.markerNames.map((name, index) => (
													<Badge key={name} variant="outline">
														{t("print.markerLevel", {
															name,
															level: selectedPrinter.markerLevels[index] ?? "?",
														})}
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
										<Label>{t("print.paperSize")}</Label>
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
												<SelectItem value="selphy_postcard">{t("print.paperSelphy")}</SelectItem>
												<SelectItem value="4x6">{t("print.paper4x6")}</SelectItem>
												<SelectItem value="5x7">{t("print.paper5x7")}</SelectItem>
												<SelectItem value="2x6_strip">{t("print.paper2x6Strip")}</SelectItem>
												<SelectItem value="6x8">{t("print.paper6x8")}</SelectItem>
												<SelectItem value="a4">{t("print.paperA4")}</SelectItem>
												<SelectItem value="letter">{t("print.paperLetter")}</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>{t("print.mediaType")}</Label>
										<Select
											value={formData.printMediaType}
											onValueChange={(value) => setFormData({ ...formData, printMediaType: value })}
										>
											<SelectTrigger className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="photo_glossy">{t("print.mediaGlossy")}</SelectItem>
												<SelectItem value="photo_matte">{t("print.mediaMatte")}</SelectItem>
												<SelectItem value="photo_satin">{t("print.mediaSatin")}</SelectItem>
												<SelectItem value="photographic">{t("print.mediaPhotographic")}</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label>{t("print.borderless")}</Label>
											<p className="text-sm text-muted-foreground">{t("print.borderlessHelp")}</p>
										</div>
										<Switch
											checked={formData.printBorderless}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, printBorderless: checked })
											}
										/>
									</div>

									<div>
										<Label htmlFor="copies">{t("print.copies")}</Label>
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
										<Label>{t("print.orientation")}</Label>
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
												<SelectItem value="portrait">{t("print.portrait")}</SelectItem>
												<SelectItem value="landscape">{t("print.landscape")}</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label>{t("print.autoPrint")}</Label>
											<p className="text-sm text-muted-foreground">{t("print.autoPrintHelp")}</p>
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
										{t("print.testPrint")}
									</Button>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="security" className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="pin">{t("security.kioskAdminPin")}</Label>
								<p className="text-sm text-muted-foreground mb-2">
									{t("security.kioskAdminPinHelp")}
								</p>
								<div className="flex gap-2">
									<Input
										id="pin"
										type="password"
										value={newPin}
										onChange={(e) => setNewPin(e.target.value)}
										placeholder={t("security.pinPlaceholder")}
										minLength={4}
									/>
									<Button type="button" onClick={handleSetPin} disabled={newPin.length < 4}>
										{t("security.setPin")}
									</Button>
								</div>
							</div>

							<div className="border-t pt-6 mt-8">
								<h3 className="text-lg font-semibold text-destructive mb-2">
									{t("security.dangerZone")}
								</h3>
								<p className="text-sm text-muted-foreground mb-4">{t("security.dangerZoneHelp")}</p>
								<Button variant="destructive" onClick={handleDelete}>
									<Trash2 className="h-4 w-4 mr-2" />
									{t("security.deleteEvent")}
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
