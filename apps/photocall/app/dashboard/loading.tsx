import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-9 w-24" />
				</div>
			</header>
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8 flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-9 w-72" />
						<Skeleton className="h-5 w-96" />
					</div>
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }, (_, i) => i).map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</main>
		</div>
	);
}
