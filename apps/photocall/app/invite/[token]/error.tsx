"use client";

import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function InviteError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Invite error", error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
			<h1 className="text-2xl font-semibold">Invitation unavailable</h1>
			<p className="max-w-md text-muted-foreground">
				We couldn&apos;t load this invitation. It may have expired or been revoked.
			</p>
			{error.digest ? (
				<p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
			) : null}
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button onClick={reset}>Try again</Button>
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
