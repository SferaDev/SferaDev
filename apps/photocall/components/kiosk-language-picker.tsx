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
import { kioskLocales } from "@/i18n/kiosk-messages";
import { useKioskLocale } from "./kiosk-i18n-provider";

/**
 * Compact guest-facing language picker for the kiosk. Reads/writes the locale
 * through {@link useKioskLocale}, which persists the choice to localStorage and
 * re-renders the kiosk subtree in the chosen language. Only the fully
 * translated kiosk locales (en/es/ca) are offered.
 */
export function KioskLanguagePicker({ className }: { className?: string }) {
	const { locale, setLocale } = useKioskLocale();
	const t = useTranslations("kiosk.common");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className={className} aria-label={t("changeLanguage")}>
					<Globe className="h-4 w-4" aria-hidden="true" />
					<span className="hidden sm:inline">{localeNames[locale]}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{kioskLocales.map((loc) => (
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
