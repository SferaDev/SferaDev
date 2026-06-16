"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

/**
 * Two-column auth chrome: a branded panel on the left (hidden on small screens)
 * and the auth form on the right. Lives under {@link DashboardI18nProvider} so
 * the marketing copy follows the operator's chosen admin language.
 */
export function AuthBranding({ children }: { children: ReactNode }) {
	const t = useTranslations("dashboard.auth");

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			{/* Left side - Branding */}
			<div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
				<Link href="/" className="flex items-center gap-2">
					<Camera className="h-8 w-8" />
					<span className="text-xl font-bold">Photocall</span>
				</Link>
				<div className="space-y-4">
					<blockquote className="text-lg">{t("quote")}</blockquote>
					<p className="text-sm opacity-80">{t("quoteAuthor")}</p>
				</div>
				<p className="text-sm opacity-60">{t("tagline")}</p>
			</div>

			{/* Right side - Auth form */}
			<div className="flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-6">
					<div className="lg:hidden flex justify-center mb-8">
						<Link href="/" className="flex items-center gap-2">
							<Camera className="h-8 w-8" />
							<span className="text-xl font-bold">Photocall</span>
						</Link>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
