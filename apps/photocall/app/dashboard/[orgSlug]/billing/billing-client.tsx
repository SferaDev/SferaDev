"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	CreditCard,
	ImageIcon,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getBillingOverview, getInvoices, getPortalUrl, startCheckout } from "@/actions/billing";
import { getOrganizationBySlug } from "@/actions/organizations";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
	const t = useTranslations("dashboard.billing");
	const tc = useTranslations("dashboard.common");
	const to = useTranslations("dashboard.orgs");

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
					<h1 className="text-2xl font-bold mb-2">{to("notFoundTitle")}</h1>
					<Button onClick={() => router.push("/dashboard")}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{tc("backToDashboard")}
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
						<div className="flex-1">
							<h1 className="font-bold text-xl">{t("title")}</h1>
							<p className="text-sm text-muted-foreground">{organization.name}</p>
						</div>
						<DashboardLanguagePicker />
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{success && (
					<Alert variant="success" className="mb-8">
						<CheckCircle2 className="h-4 w-4" />
						<AlertTitle>{t("checkoutCompleteTitle")}</AlertTitle>
						<AlertDescription>{t("checkoutCompleteDescription")}</AlertDescription>
					</Alert>
				)}
				{canceled && (
					<Alert variant="warning" className="mb-8">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>{t("checkoutCanceledTitle")}</AlertTitle>
						<AlertDescription>{t("checkoutCanceledDescription")}</AlertDescription>
					</Alert>
				)}

				<section className="mb-12 p-6 border rounded-lg">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="text-lg font-semibold">{t("currentPlan")}</h2>
							<p className="text-sm text-muted-foreground">
								{subscription
									? t("planSummary", {
											planId: subscription.planId,
											status: subscription.status,
										})
									: t("freeTier")}
							</p>
						</div>
						{isPaid ? (
							<Button variant="outline" onClick={handleManageBilling}>
								<CreditCard className="h-4 w-4 mr-2" />
								{t("manageBilling")}
							</Button>
						) : (
							<Button onClick={handleUpgrade} disabled={isPurchasing}>
								{isPurchasing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								{t("upgrade")}
							</Button>
						)}
					</div>
				</section>

				{overview && (
					<section className="mb-12">
						<h2 className="text-lg font-semibold mb-4">{t("usageThisPeriod")}</h2>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">{t("photosCaptured")}</div>
								<div className="text-2xl font-bold">{overview.usage.photosCaptured}</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">{t("activeEvents")}</div>
								<div className="text-2xl font-bold">{overview.events.length}</div>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground mb-1">
									{t("totalPhotosAcrossEvents")}
								</div>
								<div className="text-2xl font-bold">
									{overview.events.reduce((sum, e) => sum + e.photoCount, 0)}
								</div>
							</div>
						</div>
					</section>
				)}

				{overview && overview.events.length > 0 && (
					<section className="mb-12">
						<h2 className="text-lg font-semibold mb-4">{t("photosByEvent")}</h2>
						<div className="border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-4 py-3 text-left text-sm font-medium">{t("event")}</th>
										<th className="px-4 py-3 text-right text-sm font-medium">{t("photos")}</th>
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
						<h2 className="text-lg font-semibold mb-4">{t("invoices")}</h2>
						<div className="border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-4 py-3 text-left text-sm font-medium">{t("date")}</th>
										<th className="px-4 py-3 text-left text-sm font-medium">{t("status")}</th>
										<th className="px-4 py-3 text-right text-sm font-medium">{t("amount")}</th>
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
