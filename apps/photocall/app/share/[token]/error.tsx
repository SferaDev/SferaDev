"use client";

import { AlertTriangle, Camera, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ShareError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Share error", error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">We couldn&apos;t load that photo</h1>
				<p className="max-w-md text-muted-foreground">
					The link may have expired or the photo was deleted. Please try again.
				</p>
				{error.digest ? (
					<p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
				) : null}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button onClick={reset} className="gap-2">
					<Camera className="h-4 w-4" aria-hidden="true" />
					Try again
				</Button>
				<Button asChild variant="outline" className="gap-2">
					<Link href="/">
						<Home className="h-4 w-4" aria-hidden="true" />
						Home
					</Link>
				</Button>
			</div>
		</main>
	);
}
