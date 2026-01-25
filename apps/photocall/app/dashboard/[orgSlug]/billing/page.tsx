"use client";

import { useAction, useConvexAuth, useQuery } from "convex/react";
import { Building2, Check, ChevronLeft, CreditCard, Crown, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PLANS = [
	{
		id: "free",
		name: "Free",
		price: "$0",
		period: "forever",
		icon: Building2,
		features: [
			"1 event",
			"100 photos per event",
			"500 MB storage",
			"1 team member",
			"Basic templates",
		],
		cta: "Current Plan",
		disabled: true,
	},
	{
		id: "starter",
		name: "Starter",
		price: "$29",
		period: "/month",
		icon: Zap,
		features: [
			"5 events",
			"500 photos per event",
			"5 GB storage",
			"3 team members",
			"Custom branding",
			"Remove watermark",
			"Analytics",
		],
		cta: "Upgrade",
		popular: true,
	},
	{
		id: "pro",
		name: "Pro",
		price: "$79",
		period: "/month",
		icon: Crown,
		features: [
			"20 events",
			"2,000 photos per event",
			"25 GB storage",
			"10 team members",
			"Everything in Starter",
			"Priority support",
			"API access",
		],
		cta: "Upgrade",
	},
	{
		id: "enterprise",
		name: "Enterprise",
		price: "Custom",
		period: "",
		icon: Building2,
		features: [
			"Unlimited events",
			"Unlimited photos",
			"100+ GB storage",
			"Unlimited team members",
			"Everything in Pro",
			"Custom domain",
			"Dedicated support",
		],
		cta: "Contact Sales",
	},
];

export default function BillingPage() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;

	const organization = useQuery(api.organizations.getBySlug, { slug: orgSlug });
	const subscription = useQuery(
		api.stripe.getSubscription,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);
	const usage = useQuery(
		api.organizations.getUsage,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);

	const createCheckout = useAction(api.stripe.createCheckoutSession);
	const createPortal = useAction(api.stripe.createPortalSession);

	const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

	const success = searchParams.get("success");
	const canceled = searchParams.get("canceled");

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleUpgrade = async (tier: "starter" | "pro" | "enterprise") => {
		if (!organization) return;

		if (tier === "enterprise") {
			window.location.href = "mailto:sales@photocall.app?subject=Enterprise%20Plan%20Inquiry";
			return;
		}

		setIsUpgrading(tier);
		try {
			const result = await createCheckout({
				organizationId: organization._id as Id<"organizations">,
				tier,
				billingPeriod: "monthly",
			});
			if (result.url) {
				window.location.href = result.url;
			}
		} catch (error) {
			console.error("Failed to create checkout:", error);
		} finally {
			setIsUpgrading(null);
		}
	};

	const handleManageBilling = async () => {
		if (!organization) return;
		try {
			const result = await createPortal({
				organizationId: organization._id as Id<"organizations">,
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

	const currentTier = subscription?.tier ?? "free";

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
						Successfully upgraded your plan!
					</div>
				)}
				{canceled && (
					<div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg">
						Checkout was canceled. No changes were made.
					</div>
				)}

				{/* Current Usage */}
				{usage && (
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4">Current Usage</h2>
						<div className="grid gap-4 md:grid-cols-4">
							<UsageCard label="Events" used={usage.events.used} limit={usage.events.limit} />
							<UsageCard
								label="Storage"
								used={formatBytes(usage.storage.used)}
								limit={usage.storage.limit === -1 ? "Unlimited" : formatBytes(usage.storage.limit)}
								percentage={
									usage.storage.limit === -1 ? 0 : (usage.storage.used / usage.storage.limit) * 100
								}
							/>
							<UsageCard
								label="Team Members"
								used={usage.teamMembers.used}
								limit={usage.teamMembers.limit}
							/>
							<UsageCard label="Total Photos" used={usage.photos} />
						</div>
					</div>
				)}

				{/* Manage Subscription */}
				{currentTier !== "free" && (
					<div className="mb-8 p-4 border rounded-lg flex items-center justify-between">
						<div>
							<h3 className="font-semibold">Manage Subscription</h3>
							<p className="text-sm text-muted-foreground">
								Update payment method, view invoices, or cancel subscription
							</p>
						</div>
						<Button variant="outline" onClick={handleManageBilling}>
							<CreditCard className="h-4 w-4 mr-2" />
							Manage Billing
						</Button>
					</div>
				)}

				{/* Plans */}
				<h2 className="text-lg font-semibold mb-4">Plans</h2>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{PLANS.map((plan) => {
						const Icon = plan.icon;
						const isCurrent = plan.id === currentTier;

						return (
							<div
								key={plan.id}
								className={`relative p-6 border rounded-lg ${
									plan.popular ? "border-primary ring-2 ring-primary" : ""
								} ${isCurrent ? "bg-muted/50" : ""}`}
							>
								{plan.popular && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
										Most Popular
									</div>
								)}
								<div className="flex items-center gap-2 mb-4">
									<Icon className="h-5 w-5" />
									<h3 className="font-semibold">{plan.name}</h3>
								</div>
								<div className="mb-4">
									<span className="text-3xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground">{plan.period}</span>
								</div>
								<ul className="space-y-2 mb-6">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2 text-sm">
											<Check className="h-4 w-4 text-green-500" />
											{feature}
										</li>
									))}
								</ul>
								<Button
									className="w-full"
									variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
									disabled={isCurrent || plan.disabled || isUpgrading !== null}
									onClick={() => handleUpgrade(plan.id as "starter" | "pro" | "enterprise")}
								>
									{isUpgrading === plan.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									{isCurrent ? "Current Plan" : plan.cta}
								</Button>
							</div>
						);
					})}
				</div>
			</main>
		</div>
	);
}

function UsageCard({
	label,
	used,
	limit,
	percentage,
}: {
	label: string;
	used: number | string;
	limit?: number | string;
	percentage?: number;
}) {
	const pct =
		percentage ??
		(typeof used === "number" && typeof limit === "number" && limit !== -1
			? (used / limit) * 100
			: 0);

	return (
		<div className="p-4 border rounded-lg">
			<div className="text-sm text-muted-foreground mb-1">{label}</div>
			<div className="text-2xl font-bold">
				{used}
				{limit !== undefined && limit !== -1 && (
					<span className="text-sm font-normal text-muted-foreground">/{limit}</span>
				)}
			</div>
			{pct > 0 && (
				<div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
					<div
						className={`h-full rounded-full ${pct > 80 ? "bg-destructive" : "bg-primary"}`}
						style={{ width: `${Math.min(pct, 100)}%` }}
					/>
				</div>
			)}
		</div>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
