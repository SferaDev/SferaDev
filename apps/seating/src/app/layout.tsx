import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import type React from "react";
import "./globals.css";

const cormorant = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-cormorant",
});

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
		<html lang="en" className={cormorant.variable}>
			<body className="font-sans antialiased">
				{children}
				<Analytics />
			</body>
		</html>
	);
}
