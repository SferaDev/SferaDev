import { GoogleAnalytics } from "@next/third-parties/google";
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
			<body className="min-h-screen font-mono antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<div className="min-h-screen bg-background text-foreground">
						<Header />
						{children}
					</div>
				</ThemeProvider>
			</body>
			<GoogleAnalytics gaId="G-BP4YFYF5ZM" />
		</html>
	);
}
