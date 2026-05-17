import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
	return (
		<div className="min-h-screen p-8">
			<div className="mx-auto max-w-4xl space-y-6">
				<Skeleton className="h-12 w-1/2" />
				<Skeleton className="h-6 w-3/4" />
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			</div>
		</div>
	);
}
