"use client";

import { useAction, useConvexAuth, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import {
	Camera,
	Check,
	ChevronLeft,
	CreditCard,
	ImageIcon,
	Loader2,
	Plus,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { BillingSummary, EventBillingSummary } from "@/convex/lib/types";

// Type-safe API references for functions not yet in generated types
type StripeApi = {
	getBillingSummary: FunctionReference<
		"query",
		"public",
		{ organizationId: Id<"organizations"> },
		BillingSummary | null
	>;
	purchaseEvent: FunctionReference<
		"action",
		"public",
		{ organizationId: Id<"organizations"> },
		{ url: string | null }
	>;
	createPortalSession: FunctionReference<
		"action",
		"public",
		{ organizationId: Id<"organizations"> },
		{ url: string }
	>;
};

const stripeApi = api.stripe as unknown as StripeApi;

const FREE_FEATURES = ["1 free event", "10 photos included", "Basic templates", "QR code sharing"];

const PAID_FEATURES = [
	"$49 per event",
	"200 photos included per event",
	"$0.25 per additional photo",
	"Custom branding",
	"Remove watermark",
	"Priority support",
	"Analytics dashboard",
	"10 team members",
];

export default function BillingPage() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;

	const organization = useQuery(api.organizations.getBySlug, { slug: orgSlug });
	const billingSummary = useQuery(
		stripeApi.getBillingSummary,
		organization ? { organizationId: organization._id } : "skip",
	);

	const purchaseEvent = useAction(stripeApi.purchaseEvent);
	const createPortal = useAction(stripeApi.createPortalSession);

	const [isPurchasing, setIsPurchasing] = useState(false);

	const success = searchParams.get("success");
	const canceled = searchParams.get("canceled");

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handlePurchaseEvent = async () => {
		if (!organization) return;

		setIsPurchasing(true);
		try {
			const result = await purchaseEvent({
				organizationId: organization._id,
			});
			if (result.url) {
				window.location.href = result.url;
			}
		} catch (error) {
			console.error("Failed to create checkout:", error);
		} finally {
			setIsPurchasing(false);
		}
	};

	const handleManageBilling = async () => {
		if (!organization) return;
		try {
			const result = await createPortal({
				organizationId: organization._id,
			});
			if (result.url) {
				window.location.href = result.url;
			}
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

	const isPaid = billingSummary?.tier === "paid";

	// Calculate total photos with proper typing
	const totalPhotos = billingSummary?.events.reduce(
		(sum: number, event: EventBillingSummary) => sum + event.photoCount,
		0,
	);

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

			<main className="container mx-auto px-4 py-8">
				{success && (
					<div className="mb-8 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
						Payment successful! Your event credit has been added.
					</div>
				)}
				{canceled && (
					<div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg">
						Checkout was canceled. No changes were made.
					</div>
				)}

				{/* Pricing Cards */}
				<div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-12">
					{/* Free Plan */}
					<div className={`p-6 border rounded-lg ${!isPaid ? "ring-2 ring-primary" : ""}`}>
						<div className="flex items-center gap-2 mb-4">
							<Camera className="h-5 w-5" />
							<h3 className="font-semibold">Free</h3>
							{!isPaid && (
								<span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
									Current
								</span>
							)}
						</div>
						<div className="mb-4">
							<span className="text-3xl font-bold">$0</span>
							<span className="text-muted-foreground"> forever</span>
						</div>
						<ul className="space-y-2 mb-6">
							{FREE_FEATURES.map((feature) => (
								<li key={feature} className="flex items-center gap-2 text-sm">
									<Check className="h-4 w-4 text-green-500 flex-shrink-0" />
									{feature}
								</li>
							))}
						</ul>
						<Button className="w-full" variant="outline" disabled>
							{!isPaid ? "Current Plan" : "Free tier included"}
						</Button>
					</div>

					{/* Paid Plan */}
					<div className={`p-6 border rounded-lg ${isPaid ? "ring-2 ring-primary" : ""}`}>
						<div className="flex items-center gap-2 mb-4">
							<Sparkles className="h-5 w-5" />
							<h3 className="font-semibold">Pay Per Event</h3>
							{isPaid && (
								<span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
									Active
								</span>
							)}
						</div>
						<div className="mb-4">
							<span className="text-3xl font-bold">$49</span>
							<span className="text-muted-foreground"> / event</span>
						</div>
						<ul className="space-y-2 mb-6">
							{PAID_FEATURES.map((feature) => (
								<li key={feature} className="flex items-center gap-2 text-sm">
									<Check className="h-4 w-4 text-green-500 flex-shrink-0" />
									{feature}
								</li>
							))}
						</ul>
						<Button className="w-full" onClick={handlePurchaseEvent} disabled={isPurchasing}>
							{isPurchasing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							<Plus className="h-4 w-4 mr-2" />
							Purchase Event
						</Button>
					</div>
				</div>

				{/* Usage Summary */}
				{billingSummary && (
					<div className="max-w-4xl mx-auto">
						<h2 className="text-lg font-semibold mb-4">Usage Summary</h2>

						<div className="grid gap-4 md:grid-cols-3 mb-8">
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Event Credits</div>
								<div className="text-2xl font-bold">
									{billingSummary.eventsUsed}
									<span className="text-sm font-normal text-muted-foreground">
										/{billingSummary.eventCredits}
									</span>
								</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Total Photos</div>
								<div className="text-2xl font-bold">{totalPhotos ?? 0}</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">Total Overages</div>
								<div className="text-2xl font-bold">
									{billingSummary.totalOverageCost > 0
										? `$${(billingSummary.totalOverageCost / 100).toFixed(2)}`
										: "$0.00"}
								</div>
							</div>
						</div>

						{/* Event Details */}
						{billingSummary.events.length > 0 && (
							<div className="border rounded-lg overflow-hidden">
								<table className="w-full">
									<thead className="bg-muted/50">
										<tr>
											<th className="px-4 py-3 text-left text-sm font-medium">Event</th>
											<th className="px-4 py-3 text-right text-sm font-medium">Photos</th>
											<th className="px-4 py-3 text-right text-sm font-medium">Included</th>
											<th className="px-4 py-3 text-right text-sm font-medium">Overages</th>
											<th className="px-4 py-3 text-right text-sm font-medium">Cost</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{billingSummary.events.map((event: EventBillingSummary) => (
											<tr key={event.eventId}>
												<td className="px-4 py-3 text-sm">
													<div className="flex items-center gap-2">
														<ImageIcon className="h-4 w-4 text-muted-foreground" />
														{event.name}
													</div>
												</td>
												<td className="px-4 py-3 text-sm text-right">{event.photoCount}</td>
												<td className="px-4 py-3 text-sm text-right text-muted-foreground">
													{event.includedPhotos}
												</td>
												<td className="px-4 py-3 text-sm text-right">
													{event.overagePhotos > 0 ? (
														<span className="text-orange-600">{event.overagePhotos}</span>
													) : (
														<span className="text-muted-foreground">0</span>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-right">
													{event.overageCost > 0 ? `$${(event.overageCost / 100).toFixed(2)}` : "-"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{/* Manage Billing */}
						{isPaid && organization.stripeCustomerId && (
							<div className="mt-8 p-4 border rounded-lg flex items-center justify-between">
								<div>
									<h3 className="font-semibold">Payment History</h3>
									<p className="text-sm text-muted-foreground">
										View past payments and download invoices
									</p>
								</div>
								<Button variant="outline" onClick={handleManageBilling}>
									<CreditCard className="h-4 w-4 mr-2" />
									View Invoices
								</Button>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
