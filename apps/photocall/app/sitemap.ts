import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://photocall.app";

	// Generate sitemap entries for all locales
	const localeEntries = locales.map((locale) => ({
		url: `${baseUrl}/${locale}`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: locale === "en" ? 1 : 0.8,
		alternates: {
			languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}`])),
		},
	}));

	// Static pages
	const staticPages = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/sign-in`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.5,
		},
	];

	return [...staticPages, ...localeEntries];
}
