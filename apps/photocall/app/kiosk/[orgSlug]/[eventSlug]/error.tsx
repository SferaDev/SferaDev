"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function KioskError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("kiosk.error");

	useEffect(() => {
		console.error("Kiosk error", error);
	}, [error]);

	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black p-8 text-center text-white"
			role="alert"
		>
			<AlertTriangle className="h-16 w-16 text-yellow-400" aria-hidden="true" />
			<div className="space-y-3 max-w-md">
				<h1 className="text-3xl font-bold">{t("title")}</h1>
				<p className="text-white/80">{t("description")}</p>
				{error.digest ? (
					<p className="text-xs text-white/50">{t("reference", { digest: error.digest })}</p>
				) : null}
			</div>
			<Button
				size="lg"
				onClick={reset}
				className="gap-2 rounded-full px-10 py-6 text-lg"
				variant="secondary"
			>
				<RotateCcw className="h-5 w-5" aria-hidden="true" />
				{t("startOver")}
			</Button>
		</div>
	);
}
