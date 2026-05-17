"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function KioskError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
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
				<h1 className="text-3xl font-bold">Something interrupted the kiosk</h1>
				<p className="text-white/80">
					Don&apos;t worry, your event is fine. Tap the button below to start over.
				</p>
				{error.digest ? <p className="text-xs text-white/50">Reference: {error.digest}</p> : null}
			</div>
			<Button
				size="lg"
				onClick={reset}
				className="gap-2 rounded-full px-10 py-6 text-lg"
				variant="secondary"
			>
				<RotateCcw className="h-5 w-5" aria-hidden="true" />
				Start over
			</Button>
		</div>
	);
}
