"use client";

import { ChevronLeft, CreditCard, ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getBillingOverview, getInvoices, getPortalUrl, startCheckout } from "@/actions/billing";
import { getOrganizationBySlug } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

const PRO_PLAN_ID = process.env.NEXT_PUBLIC_PHOTOCALL_PRO_PLAN_ID ?? "photocall_pro";

export default function BillingPage() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;

	const { data: organization } = useSWR(["organizations", orgSlug], () =>
		getOrganizationBySlug(orgSlug),
	);

	const { data: overview } = useSWR(
		organization ? ["billing-overview", organization.id] : null,
		() => getBillingOverview(organization!.id),
	);

	const { data: invoices } = useSWR(
		organization && overview?.subscription ? ["invoices", organization.id] : null,
		() => getInvoices(organization!.id),
	);

	const [isPurchasing, setIsPurchasing] = useState(false);

	const success = searchParams.get("success");
	const canceled = searchParams.get("canceled");

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleUpgrade = async () => {
		if (!organization) return;
		setIsPurchasing(true);
		try {
			const result = await startCheckout(organization.id, PRO_PLAN_ID);
			window.location.href = result.url;
		} catch (error) {
			console.error("Failed to start checkout:", error);
			setIsPurchasing(false);
		}
	};

	const handleManageBilling = async () => {
		if (!organization) return;
		try {
			const { url } = await getPortalUrl(organization.id);
			window.location.href = url;
		} catch (error) {
			console.error("Failed to open billing portal:", error);
		}
	};

	if (authLoading || organization === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!organization) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Organization not found</h1>
					<Button onClick={() => router.push("/dashboard")}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	const subscription = overview?.subscription ?? null;
	const isPaid = subscription?.status === "active" || subscription?.status === "trialing";

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-4">
						<Link
							href={`/dashboard/${orgSlug}`}
							className="text-muted-foreground hover:text-foreground"
						>
							<ChevronLeft className="h-5 w-5" />
						</Link>
						<div>
							<h1 className="font-bold text-xl">Billing</h1>
							<p className="text-sm text-muted-foreground">{organization.name}</p>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{success && (
					<div className="mb-8 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
						Checkout complete. Your subscription is active.
					</div>
				)}
				{canceled && (
					<div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg">
						Checkout was canceled. No changes were made.
					</div>
				)}

				<section className="mb-12 p-6 border rounded-lg">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="text-lg font-semibold">Current plan</h2>
							<p className="text-sm text-muted-foreground">
								{subscription
									? `${subscription.planId} · ${subscription.status}`
									: "Free tier (default plan)"}
							</p>
						</div>
						{isPaid ? (
							<Button variant="outline" onClick={handleManageBilling}>
								<CreditCard className="h-4 w-4 mr-2" />
								Manage billing
							</Button>
						) : (
							<Button onClick={handleUpgrade} disabled={isPurchasing}>
								{isPurchasing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Upgrade
							</Button>
						)}
					</div>
				</section>

				{overview && (
					<section className="mb-12">
						<h2 className="text-lg font-semibold mb-4">Usage this period</h2>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Photos captured</div>
								<div className="text-2xl font-bold">{overview.usage.photosCaptured}</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Active events</div>
								<div className="text-2xl font-bold">{overview.events.length}</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Total photos across events</div>
								<div className="text-2xl font-bold">
									{overview.events.reduce((sum, e) => sum + e.photoCount, 0)}
								</div>
							</div>
						</div>
					</section>
				)}

				{overview && overview.events.length > 0 && (
					<section className="mb-12">
						<h2 className="text-lg font-semibold mb-4">Photos by event</h2>
						<div className="border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-4 py-3 text-left text-sm font-medium">Event</th>
										<th className="px-4 py-3 text-right text-sm font-medium">Photos</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{overview.events.map((event) => (
										<tr key={event.eventId}>
											<td className="px-4 py-3 text-sm">
												<div className="flex items-center gap-2">
													<ImageIcon className="h-4 w-4 text-muted-foreground" />
													{event.name}
												</div>
											</td>
											<td className="px-4 py-3 text-sm text-right">{event.photoCount}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
				)}

				{invoices && invoices.length > 0 && (
					<section>
						<h2 className="text-lg font-semibold mb-4">Invoices</h2>
						<div className="border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-4 py-3 text-left text-sm font-medium">Date</th>
										<th className="px-4 py-3 text-left text-sm font-medium">Status</th>
										<th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{invoices.map((inv) => (
										<tr key={inv.id}>
											<td className="px-4 py-3 text-sm">
												{new Date(inv.created).toLocaleDateString()}
											</td>
											<td className="px-4 py-3 text-sm capitalize">{inv.status ?? "—"}</td>
											<td className="px-4 py-3 text-sm text-right">
												{(inv.amount / 100).toLocaleString(undefined, {
													style: "currency",
													currency: inv.currency.toUpperCase(),
												})}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
