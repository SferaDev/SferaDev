import { Skeleton } from "@/components/ui/skeleton";

export default function InviteLoading() {
	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6">
				<Skeleton className="h-7 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-10 w-full" />
			</div>
		</main>
	);
}
