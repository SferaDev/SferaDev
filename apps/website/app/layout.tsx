import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";

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
		<html lang="en" className={cn(GeistSans.variable, GeistMono.variable)}>
			<body className="min-h-screen font-mono antialiased">
				<div className="min-h-screen bg-black text-gray-50">
					<Header />
					{children}
				</div>
			</body>
			<GoogleAnalytics gaId="G-BP4YFYF5ZM" />
		</html>
	);
}
