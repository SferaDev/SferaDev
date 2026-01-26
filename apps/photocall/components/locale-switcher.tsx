"use client";

import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale, localeNames, locales } from "@/i18n/config";

export function LocaleSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const handleLocaleChange = (newLocale: Locale) => {
		// Remove the current locale from the pathname and add the new one
		const segments = pathname.split("/");
		segments[1] = newLocale;
		const newPath = segments.join("/") || `/${newLocale}`;

		startTransition(() => {
			router.replace(newPath);
		});
	};

	// Show a subset of popular languages in the dropdown
	const popularLocales: Locale[] = [
		"en",
		"es",
		"fr",
		"de",
		"it",
		"pt",
		"nl",
		"ru",
		"zh",
		"ja",
		"ko",
		"ar",
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
					<Globe className="h-4 w-4" />
					<span className="hidden sm:inline">{localeNames[locale as Locale]}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
				{/* Popular languages first */}
				{popularLocales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => handleLocaleChange(loc)}
						className={locale === loc ? "bg-accent" : ""}
					>
						{localeNames[loc]}
					</DropdownMenuItem>
				))}
				<div className="my-2 border-t" />
				{/* Rest of the languages */}
				{locales
					.filter((loc) => !popularLocales.includes(loc))
					.map((loc) => (
						<DropdownMenuItem
							key={loc}
							onClick={() => handleLocaleChange(loc)}
							className={locale === loc ? "bg-accent" : ""}
						>
							{localeNames[loc]}
						</DropdownMenuItem>
					))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
