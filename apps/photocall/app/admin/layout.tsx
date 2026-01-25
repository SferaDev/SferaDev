import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin - Photocall",
	description: "Manage your photo booth settings and photos",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
