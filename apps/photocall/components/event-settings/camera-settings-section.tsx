"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/** Camera + photobooth-capture fields the camera section reads and writes. */
export interface CameraSettingsData {
	defaultCamera: "user" | "environment";
	cameraDeviceId: string;
	cameraDeviceLabel: string;
	captureZoom: number;
	mirrorPhotos: boolean;
	captureDefaultCountdown: number;
	captureAutoShoot: boolean;
	captureAutoStart: boolean;
	captureWhoChoosesFilter: "guest" | "host";
	boomerangEnabled: boolean;
	photoQuality: number;
	maxPhotoDimension: number;
}

interface CameraSettingsSectionProps {
	data: CameraSettingsData;
	/** Applies a partial patch to the parent form state. */
	onChange: (patch: Partial<CameraSettingsData>) => void;
	/** Detected capture devices, populated by "Detect cameras". */
	cameras: MediaDeviceInfo[];
	camerasLoading: boolean;
	onDetectCameras: () => void;
}

export function CameraSettingsSection({
	data,
	onChange,
	cameras,
	camerasLoading,
	onDetectCameras,
}: CameraSettingsSectionProps) {
	const t = useTranslations("dashboard.eventSettings");

	return (
		<div className="space-y-4">
			<div>
				<Label>{t("camera.defaultCamera")}</Label>
				<Select
					value={data.defaultCamera}
					onValueChange={(value: "user" | "environment") => onChange({ defaultCamera: value })}
				>
					<SelectTrigger className="mt-2">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="user">{t("camera.frontCamera")}</SelectItem>
						<SelectItem value="environment">{t("camera.backCamera")}</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-sm text-muted-foreground mt-2">{t("camera.defaultCameraHelp")}</p>
			</div>
			<div>
				<div className="flex items-center justify-between">
					<Label>{t("camera.captureDevice")}</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onDetectCameras}
						disabled={camerasLoading}
					>
						{camerasLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
						{t("camera.detectCameras")}
					</Button>
				</div>
				<p className="text-sm text-muted-foreground mt-1">{t("camera.captureDeviceHelp")}</p>
				<Select
					value={data.cameraDeviceId || "default"}
					onValueChange={(value) => {
						if (value === "default") {
							onChange({ cameraDeviceId: "", cameraDeviceLabel: "" });
							return;
						}
						const device = cameras.find((c) => c.deviceId === value);
						onChange({ cameraDeviceId: value, cameraDeviceLabel: device?.label ?? "" });
					}}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder={t("camera.systemDefault")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="default">{t("camera.systemDefaultFacingMode")}</SelectItem>
						{data.cameraDeviceId && !cameras.some((c) => c.deviceId === data.cameraDeviceId) && (
							<SelectItem value={data.cameraDeviceId}>
								{data.cameraDeviceLabel || t("camera.savedDeviceNotDetected")}
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
					{t("camera.photoQuality", { percent: Math.round(data.photoQuality * 100) })}
				</Label>
				<input
					id="quality"
					type="range"
					min="0.5"
					max="1"
					step="0.1"
					value={data.photoQuality}
					onChange={(e) => onChange({ photoQuality: Number.parseFloat(e.target.value) })}
					className="mt-2 w-full"
				/>
			</div>
			<div>
				<Label htmlFor="dimension">{t("camera.maxDimension")}</Label>
				<Select
					value={data.maxPhotoDimension.toString()}
					onValueChange={(value) => onChange({ maxPhotoDimension: Number.parseInt(value, 10) })}
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
			<div>
				<Label htmlFor="zoom">{t("camera.zoom", { zoom: data.captureZoom.toFixed(1) })}</Label>
				<input
					id="zoom"
					type="range"
					min="1"
					max="3"
					step="0.1"
					value={data.captureZoom}
					onChange={(e) => onChange({ captureZoom: Number.parseFloat(e.target.value) })}
					className="mt-2 w-full"
				/>
				<p className="text-sm text-muted-foreground">{t("camera.zoomHelp")}</p>
			</div>
			<div className="flex items-center justify-between">
				<div>
					<Label>{t("camera.mirror")}</Label>
					<p className="text-sm text-muted-foreground">{t("camera.mirrorHelp")}</p>
				</div>
				<Switch
					checked={data.mirrorPhotos}
					onCheckedChange={(checked) => onChange({ mirrorPhotos: checked })}
				/>
			</div>

			<div className="border-t pt-6 mt-2 space-y-4">
				<h3 className="text-lg font-semibold">{t("camera.photoboothCapture")}</h3>
				<div>
					<Label htmlFor="countdown">
						{t("camera.countdown", { seconds: data.captureDefaultCountdown })}
					</Label>
					<input
						id="countdown"
						type="range"
						min="0"
						max="10"
						step="1"
						value={data.captureDefaultCountdown}
						onChange={(e) =>
							onChange({ captureDefaultCountdown: Number.parseInt(e.target.value, 10) })
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
						checked={data.captureAutoStart}
						onCheckedChange={(checked) => onChange({ captureAutoStart: checked })}
					/>
				</div>
				<div className="flex items-center justify-between">
					<div>
						<Label>{t("camera.autoShoot")}</Label>
						<p className="text-sm text-muted-foreground">{t("camera.autoShootHelp")}</p>
					</div>
					<Switch
						checked={data.captureAutoShoot}
						onCheckedChange={(checked) => onChange({ captureAutoShoot: checked })}
					/>
				</div>
				<div>
					<Label>{t("camera.whoChoosesFilter")}</Label>
					<Select
						value={data.captureWhoChoosesFilter}
						onValueChange={(value: "guest" | "host") =>
							onChange({ captureWhoChoosesFilter: value })
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
						checked={data.boomerangEnabled}
						onCheckedChange={(checked) => onChange({ boomerangEnabled: checked })}
					/>
				</div>
			</div>
		</div>
	);
}
