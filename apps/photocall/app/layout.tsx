import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
	title: {
		default: "Photocall - Photo Booth Kiosk for Events",
		template: "%s · Photocall",
	},
	description:
		"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations. Easy setup, beautiful templates, instant sharing.",
	keywords:
		"photo booth, event photo booth, wedding photo booth, party photos, corporate events, kiosk, photo kiosk, instant photos, QR sharing, event photography",
	applicationName: "Photocall",
	authors: [{ name: "Photocall" }],
	manifest: "/manifest.webmanifest",
	openGraph: {
		title: "Photocall - Photo Booth Kiosk for Events",
		description:
			"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
		type: "website",
		siteName: "Photocall",
	},
	twitter: {
		card: "summary_large_image",
		title: "Photocall - Photo Booth Kiosk for Events",
		description:
			"A modern photo booth kiosk for weddings, parties, corporate events, and celebrations.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
			<body className="min-h-screen font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<div className="min-h-screen bg-background text-foreground">{children}</div>
						<Toaster />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
