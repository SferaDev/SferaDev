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
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Alexis Rico - SferaDev",
	description:
		"Portfolio of Alexis Rico, showcasing my work in development, and open source contributions.",
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
