import { Camera, Check, Download, QrCode, Settings, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations();

	return (
		<div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			{/* Hero Section */}
			<header className="container mx-auto px-4 py-6">
				<nav className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Camera className="h-8 w-8 text-rose-500" />
						<span className="text-2xl font-bold">Photocall</span>
					</div>
					<div className="flex items-center gap-4">
						<LocaleSwitcher />
						<Link href="/dashboard">
							<Button variant="ghost">{t("nav.dashboard")}</Button>
						</Link>
						<Link href="/sign-in">
							<Button variant="ghost">{t("nav.signIn")}</Button>
						</Link>
					</div>
				</nav>
			</header>

			<main>
				{/* Hero */}
				<section className="container mx-auto px-4 py-20 text-center">
					<div className="mx-auto max-w-3xl">
						<h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
							{t("hero.title")}
							<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
								{" "}
								{t("hero.titleHighlight")}
							</span>
						</h1>
						<p className="mb-8 text-xl text-muted-foreground">{t("hero.subtitle")}</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/sign-in">
								<Button size="xl" className="gap-2">
									<Camera className="h-5 w-5" />
									{t("hero.launchKiosk")}
								</Button>
							</Link>
							<Link href="/dashboard">
								<Button size="xl" variant="outline" className="gap-2">
									<Settings className="h-5 w-5" />
									{t("hero.adminPanel")}
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Event Types */}
				<section className="container mx-auto px-4 py-8">
					<div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
						<span className="rounded-full bg-rose-100 px-4 py-2 dark:bg-rose-900/30">
							{t("eventTypes.weddings")}
						</span>
						<span className="rounded-full bg-pink-100 px-4 py-2 dark:bg-pink-900/30">
							{t("eventTypes.parties")}
						</span>
						<span className="rounded-full bg-purple-100 px-4 py-2 dark:bg-purple-900/30">
							{t("eventTypes.corporate")}
						</span>
						<span className="rounded-full bg-indigo-100 px-4 py-2 dark:bg-indigo-900/30">
							{t("eventTypes.birthdays")}
						</span>
						<span className="rounded-full bg-blue-100 px-4 py-2 dark:bg-blue-900/30">
							{t("eventTypes.graduations")}
						</span>
						<span className="rounded-full bg-cyan-100 px-4 py-2 dark:bg-cyan-900/30">
							{t("eventTypes.celebrations")}
						</span>
					</div>
				</section>

				{/* Features */}
				<section className="container mx-auto px-4 py-20">
					<h2 className="mb-12 text-center text-3xl font-bold">{t("features.title")}</h2>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<Camera className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>{t("features.easyCapture.title")}</CardTitle>
								<CardDescription>{t("features.easyCapture.description")}</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Sparkles className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>{t("features.beautifulTemplates.title")}</CardTitle>
								<CardDescription>{t("features.beautifulTemplates.description")}</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<QrCode className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>{t("features.instantSharing.title")}</CardTitle>
								<CardDescription>{t("features.instantSharing.description")}</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Download className="mb-2 h-10 w-10 text-rose-500" />
								<CardTitle>{t("features.easyExport.title")}</CardTitle>
								<CardDescription>{t("features.easyExport.description")}</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>

				{/* Pricing */}
				<section className="bg-muted/30 py-20">
					<div className="container mx-auto px-4">
						<h2 className="mb-12 text-center text-3xl font-bold">{t("pricing.title")}</h2>
						<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
							{/* Free Plan */}
							<Card className="relative">
								<CardHeader>
									<CardTitle className="text-xl">{t("pricing.free.title")}</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">{t("pricing.free.price")}</span>
										<span className="text-muted-foreground"> {t("pricing.free.period")}</span>
									</div>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{(t.raw("pricing.free.features") as string[]).map((feature, index) => (
											<li key={index} className="flex items-center gap-2">
												<Check className="h-4 w-4 text-green-500 flex-shrink-0" />
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>
									<Link href="/sign-in" className="block mt-6">
										<Button variant="outline" className="w-full">
											{t("cta.button")}
										</Button>
									</Link>
								</CardContent>
							</Card>

							{/* Paid Plan */}
							<Card className="relative border-rose-500">
								<div className="absolute -top-3 left-1/2 -translate-x-1/2">
									<span className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
										Popular
									</span>
								</div>
								<CardHeader>
									<CardTitle className="text-xl">{t("pricing.paid.title")}</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">{t("pricing.paid.price")}</span>
										<span className="text-muted-foreground"> {t("pricing.paid.period")}</span>
									</div>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{(t.raw("pricing.paid.features") as string[]).map((feature, index) => (
											<li key={index} className="flex items-center gap-2">
												<Check className="h-4 w-4 text-green-500 flex-shrink-0" />
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>
									<Link href="/sign-in" className="block mt-6">
										<Button className="w-full">{t("cta.button")}</Button>
									</Link>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* How it works */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<h2 className="mb-12 text-center text-3xl font-bold">{t("howItWorks.title")}</h2>
						<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									1
								</div>
								<h3 className="mb-2 text-xl font-semibold">{t("howItWorks.step1.title")}</h3>
								<p className="text-muted-foreground">{t("howItWorks.step1.description")}</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									2
								</div>
								<h3 className="mb-2 text-xl font-semibold">{t("howItWorks.step2.title")}</h3>
								<p className="text-muted-foreground">{t("howItWorks.step2.description")}</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600 dark:bg-rose-900">
									3
								</div>
								<h3 className="mb-2 text-xl font-semibold">{t("howItWorks.step3.title")}</h3>
								<p className="text-muted-foreground">{t("howItWorks.step3.description")}</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="container mx-auto px-4 py-20 text-center">
					<Card className="mx-auto max-w-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white">
						<CardContent className="p-10">
							<h2 className="mb-4 text-3xl font-bold">{t("cta.title")}</h2>
							<p className="mb-6 text-rose-100">{t("cta.subtitle")}</p>
							<Link href="/sign-in">
								<Button size="xl" variant="secondary" className="gap-2">
									<Camera className="h-5 w-5" />
									{t("cta.button")}
								</Button>
							</Link>
						</CardContent>
					</Card>
				</section>
			</main>

			<footer className="border-t py-8">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-muted-foreground">{t("footer.tagline")}</p>
						<div className="flex gap-6 text-sm text-muted-foreground">
							<Link href="/privacy" className="hover:text-foreground">
								{t("footer.privacy")}
							</Link>
							<Link href="/terms" className="hover:text-foreground">
								{t("footer.terms")}
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
