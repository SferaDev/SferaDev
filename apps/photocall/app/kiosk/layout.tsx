import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photo Booth - Photocall",
	description: "Take a photo and share it!",
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			{children}
		</div>
	);
}
