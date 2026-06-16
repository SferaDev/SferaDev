"use client";

import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";

export default function KioskLoading() {
	const t = useTranslations("kiosk.loading");

	return (
		<div
			className="flex min-h-screen items-center justify-center bg-black text-white"
			role="status"
			aria-label={t("label")}
		>
			<div className="flex flex-col items-center gap-4">
				<Camera className="h-12 w-12 animate-pulse" aria-hidden="true" />
				<span className="text-sm text-white/70">{t("preparing")}</span>
			</div>
		</div>
	);
}
