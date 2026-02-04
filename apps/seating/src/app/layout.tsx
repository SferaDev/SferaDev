import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
	title: "Wedding Seating Planner",
	description: "Create beautiful seating arrangements for your special day",
};

export const viewport: Viewport = {
	themeColor: "#c4a484",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="font-sans antialiased">
				{children}
				<Analytics />
			</body>
		</html>
	);
}
