import type { useMessages } from "next-intl";
import type { Locale } from "./config";
import caMessages from "./messages/ca.json";
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";

/** The message shape next-intl expects (matches `getMessages()`/`useMessages()`). */
type IntlMessages = ReturnType<typeof useMessages>;

/**
 * Locales the admin dashboard is fully translated into. The dashboard language
 * picker only offers these, and {@link dashboardMessages} only bundles these.
 */
export const dashboardLocales = ["en", "es", "ca"] as const;

export type DashboardLocale = (typeof dashboardLocales)[number];

/**
 * Messages bundled statically for the admin dashboard. Like the kiosk, the
 * dashboard sits outside the next-intl middleware (no URL locale prefixes), so
 * the locale is chosen on the client and the JSON is imported directly rather
 * than fetched at runtime via `i18n/request.ts`.
 */
export const dashboardMessages: Record<DashboardLocale, IntlMessages> = {
	en: enMessages,
	es: esMessages,
	ca: caMessages,
};

export function isDashboardLocale(value: string | null | undefined): value is DashboardLocale {
	return value != null && (dashboardLocales as readonly string[]).includes(value);
}

/**
 * Resolves an arbitrary locale (e.g. a full browser language tag like `es-ES`)
 * to a supported dashboard locale, falling back to `en`.
 */
export function resolveDashboardLocale(value: string | null | undefined): DashboardLocale {
	if (!value) return "en";
	if (isDashboardLocale(value)) return value;
	const base = value.split("-")[0]?.toLowerCase();
	return isDashboardLocale(base) ? base : "en";
}

// Ensure dashboard locales stay a subset of the app's configured locales.
const _dashboardLocalesAreAppLocales: readonly Locale[] = dashboardLocales;
void _dashboardLocalesAreAppLocales;
