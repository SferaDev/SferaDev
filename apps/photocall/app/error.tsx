"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Surface to monitoring; safe to ship.
		console.error("App error", error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">Something went wrong</h1>
				<p className="max-w-md text-muted-foreground">
					An unexpected error occurred. You can retry the action or return home.
				</p>
				{error.digest ? (
					<p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
				) : null}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button onClick={reset} className="gap-2">
					<RefreshCw className="h-4 w-4" aria-hidden="true" />
					Try again
				</Button>
				<Button asChild variant="outline" className="gap-2">
					<Link href="/">
						<Home className="h-4 w-4" aria-hidden="true" />
						Go home
					</Link>
				</Button>
			</div>
		</main>
	);
}
