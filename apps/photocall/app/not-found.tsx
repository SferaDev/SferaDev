import { Camera, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<Camera className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
			<div className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight">404</h1>
				<p className="max-w-md text-muted-foreground">
					We couldn&apos;t find the page you&apos;re looking for. It may have been moved or the link
					is no longer valid.
				</p>
			</div>
			<Button asChild className="gap-2">
				<Link href="/">
					<Home className="h-4 w-4" aria-hidden="true" />
					Back to home
				</Link>
			</Button>
		</main>
	);
}
