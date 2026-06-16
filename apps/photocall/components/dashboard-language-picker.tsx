"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeNames } from "@/i18n/config";
import { dashboardLocales } from "@/i18n/dashboard-messages";
import { useDashboardLocale } from "./dashboard-i18n-provider";

/**
 * Compact admin-facing language picker for the dashboard. Reads/writes the
 * locale through {@link useDashboardLocale}, which persists the choice to
 * localStorage and re-renders the dashboard subtree in the chosen language. Only
 * the fully translated dashboard locales (en/es/ca) are offered.
 */
export function DashboardLanguagePicker({ className }: { className?: string }) {
	const { locale, setLocale } = useDashboardLocale();
	const t = useTranslations("dashboard.common");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className={className} aria-label={t("changeLanguage")}>
					<Globe className="h-4 w-4" aria-hidden="true" />
					<span className="hidden sm:inline">{localeNames[locale]}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{dashboardLocales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => setLocale(loc)}
						className={locale === loc ? "bg-accent" : ""}
					>
						{localeNames[loc]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
