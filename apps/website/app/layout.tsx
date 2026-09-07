import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { feedAlternateTypes, siteConfig, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	// Absolute URLs for OpenGraph, canonicals and the generated social images all
	// resolve against the canonical apex host.
	metadataBase: new URL(siteUrl),
	title: { default: siteConfig.title, template: `%s — ${siteConfig.author.name}` },
	description: siteConfig.description,
	applicationName: siteConfig.name,
	keywords: siteConfig.keywords,
	authors: [{ name: siteConfig.author.name, url: siteUrl }],
	creator: siteConfig.author.name,
	publisher: siteConfig.author.name,
	// Pages that set their own canonical replace this object wholesale, so they
	// re-declare `types` to keep advertising the feed.
	alternates: { canonical: "/", types: feedAlternateTypes },
	openGraph: {
		type: "website",
		url: siteUrl,
		siteName: siteConfig.title,
		title: siteConfig.title,
		description: siteConfig.description,
		locale: siteConfig.locale,
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.title,
		description: siteConfig.description,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
			<body className="min-h-dvh">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<a
						href="#main-content"
						className="sr-only rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
					>
						Skip to content
					</a>
					<Header />
					<div id="main-content">{children}</div>
				</ThemeProvider>
				<Analytics />
				<SpeedInsights />
			</body>
			<GoogleAnalytics gaId="G-BP4YFYF5ZM" />
		</html>
	);
}
