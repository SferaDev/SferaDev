"use client";

import { Camera, ChevronLeft, Loader2, Printer, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getEventBySlug, updateEvent } from "@/actions/events";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
import {
	type CameraSettingsData,
	CameraSettingsSection,
} from "@/components/event-settings/camera-settings-section";
import {
	type PrintSettingsData,
	PrintSettingsSection,
} from "@/components/event-settings/print-settings-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enumerateCameras } from "@/hooks/use-camera";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import type { Orientation, PaperSize } from "@/lib/layout/types";
import type { PrintMethod } from "@/lib/print/types";

/** Camera + print fields this page owns. */
type KioskFormData = CameraSettingsData & PrintSettingsData;

export default function KioskSettingsPage() {
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
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
	const [camerasLoading, setCamerasLoading] = useState(false);
	const [formData, setFormData] = useState<KioskFormData>({
		defaultCamera: "user",
		cameraDeviceId: "",
		cameraDeviceLabel: "",
		captureZoom: 1,
		mirrorPhotos: true,
		captureDefaultCountdown: 3,
		captureAutoShoot: false,
		captureAutoStart: true,
		captureWhoChoosesFilter: "guest",
		boomerangEnabled: false,
		photoQuality: 0.9,
		maxPhotoDimension: 1920,
		printMethod: "none",
		printBridgeUrl: "",
		printPrinterId: "",
		printPaperSize: "selphy_postcard",
		printMediaType: "photo_glossy",
		printBorderless: true,
		printCopies: 1,
		printOrientation: "portrait",
		printAutoPrint: false,
	});

	useEffect(() => {
		if (event) {
			setFormData({
				defaultCamera: (event.defaultCamera as "user" | "environment") ?? "user",
				cameraDeviceId: event.cameraDeviceId ?? "",
				cameraDeviceLabel: event.cameraDeviceLabel ?? "",
				captureZoom: event.captureZoom,
				mirrorPhotos: event.mirrorPhotos,
				captureDefaultCountdown: event.captureDefaultCountdown,
				captureAutoShoot: event.captureAutoShoot,
				captureAutoStart: event.captureAutoStart,
				captureWhoChoosesFilter: (event.captureWhoChoosesFilter as "guest" | "host") ?? "guest",
				boomerangEnabled: event.boomerangEnabled,
				photoQuality: event.photoQuality,
				maxPhotoDimension: event.maxPhotoDimension,
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

	const updateForm = useCallback((patch: Partial<KioskFormData>) => {
		setFormData((prev) => ({ ...prev, ...patch }));
	}, []);

	/**
	 * Persist a printer selection to `event.printPrinterId` immediately, separate
	 * from the page-level "Save changes" button. Awaited so the picker reflects
	 * only a value that actually landed, and the SWR cache is re-validated so a
	 * reload shows the saved printer. Used both for an explicit operator pick and
	 * for auto-selecting the sole reachable printer, keeping the choice sticky so
	 * dispatched jobs always carry a `printerId`.
	 */
	const persistPrinter = useCallback(
		async (printerId: string) => {
			if (!event) return;
			await updateEvent(event.id, { printPrinterId: printerId });
			mutate((key) => Array.isArray(key) && key[0] === "events");
		},
		[event, mutate],
	);

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
								<h1 className="font-bold text-xl">{t("kioskTitle")}</h1>
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
				<Tabs defaultValue="camera" className="space-y-6">
					<TabsList className="grid grid-cols-2 w-full">
						<TabsTrigger value="camera">
							<Camera className="h-4 w-4 mr-2" />
							{t("tabs.camera")}
						</TabsTrigger>
						<TabsTrigger value="print">
							<Printer className="h-4 w-4 mr-2" />
							{t("tabs.print")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="camera" className="space-y-6">
						<CameraSettingsSection
							data={formData}
							onChange={updateForm}
							cameras={cameras}
							camerasLoading={camerasLoading}
							onDetectCameras={refreshCameras}
						/>
					</TabsContent>

					<TabsContent value="print" className="space-y-6">
						<PrintSettingsSection
							data={formData}
							onChange={updateForm}
							primaryColor={event.primaryColor ?? ""}
							onPersistPrinter={persistPrinter}
						/>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
