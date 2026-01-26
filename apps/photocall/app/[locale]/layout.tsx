import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type React from "react";
import "../globals.css";
import { StructuredData } from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { isRtlLocale, type Locale, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const messages = await getMessages();
	const metadata = messages.metadata as Record<string, string>;

	return {
		title: metadata?.title || "Photocall - Photo Booth Kiosk for Events",
		description:
			metadata?.description ||
			"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
		keywords: metadata?.keywords,
		openGraph: {
			title: metadata?.title || "Photocall - Photo Booth Kiosk for Events",
			description:
				metadata?.description ||
				"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
			type: "website",
			locale: locale,
			siteName: "Photocall",
		},
		twitter: {
			card: "summary_large_image",
			title: metadata?.title || "Photocall - Photo Booth Kiosk for Events",
			description:
				metadata?.description ||
				"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
		},
		alternates: {
			canonical: `/${locale}`,
			languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
		},
	};
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	// Validate locale
	if (!locales.includes(locale as Locale)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	const messages = await getMessages();
	const isRtl = isRtlLocale(locale as Locale);

	return (
		<html
			lang={locale}
			dir={isRtl ? "rtl" : "ltr"}
			className={cn(GeistSans.variable, GeistMono.variable)}
			suppressHydrationWarning
		>
			<body className="min-h-screen font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<NextIntlClientProvider messages={messages}>
						<StructuredData locale={locale} />
						<div className="min-h-screen bg-background text-foreground">{children}</div>
						<Toaster />
					</NextIntlClientProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
