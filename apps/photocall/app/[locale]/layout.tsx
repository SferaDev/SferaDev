import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type React from "react";
import { StructuredData } from "@/components/structured-data";
import { isRtlLocale, type Locale, locales } from "@/i18n/config";

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
			images: [
				{
					url: "/og.png",
					width: 1200,
					height: 630,
					alt: "Photocall - Photo Booth Kiosk for Events",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: metadata?.title || "Photocall - Photo Booth Kiosk for Events",
			description:
				metadata?.description ||
				"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
			images: ["/og.png"],
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
		<NextIntlClientProvider messages={messages}>
			<StructuredData locale={locale} />
			<div lang={locale} dir={isRtl ? "rtl" : "ltr"} className="contents">
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
