"use client";

import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Global error", error);
	}, [error]);

	return (
		<html lang="en">
			<body className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center font-sans">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">Something went wrong</h1>
					<p className="max-w-md text-muted-foreground">
						A critical error occurred. Please refresh the page or come back later.
					</p>
					{error.digest ? (
						<p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={reset}
					className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
				>
					Try again
				</button>
			</body>
		</html>
	);
}
