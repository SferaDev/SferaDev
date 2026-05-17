import { Skeleton } from "@/components/ui/skeleton";

export default function ShareLoading() {
	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			<header className="border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<Skeleton className="h-7 w-32" />
				</div>
			</header>
			<main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
				<div className="w-full max-w-2xl space-y-4 rounded-xl border bg-card p-4">
					<Skeleton className="aspect-3/4 w-full rounded-lg" />
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="h-4 w-1/3" />
					<div className="flex gap-3">
						<Skeleton className="h-11 flex-1" />
						<Skeleton className="h-11 flex-1" />
					</div>
				</div>
			</main>
		</div>
	);
}
