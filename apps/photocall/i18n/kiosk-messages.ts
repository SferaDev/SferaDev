import type { useMessages } from "next-intl";
import type { Locale } from "./config";
import caMessages from "./messages/ca.json";
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";

/** The message shape next-intl expects (matches `getMessages()`/`useMessages()`). */
type IntlMessages = ReturnType<typeof useMessages>;

/**
 * Locales the guest-facing kiosk is fully translated into. The kiosk language
 * picker only offers these, and {@link kioskMessages} only bundles these.
 */
export const kioskLocales = ["en", "es", "ca"] as const;

export type KioskLocale = (typeof kioskLocales)[number];

/**
 * Messages bundled statically so an offline kiosk always has its language. We
 * import the JSON directly (rather than fetching at runtime via
 * `i18n/request.ts`) because the kiosk runs without URL locale prefixes and
 * must keep working through network drops.
 */
export const kioskMessages: Record<KioskLocale, IntlMessages> = {
	en: enMessages,
	es: esMessages,
	ca: caMessages,
};

export function isKioskLocale(value: string | null | undefined): value is KioskLocale {
	return value != null && (kioskLocales as readonly string[]).includes(value);
}

/**
 * Resolves an arbitrary locale (e.g. a full browser language tag like `es-ES`)
 * to a supported kiosk locale, falling back to `en`.
 */
export function resolveKioskLocale(value: string | null | undefined): KioskLocale {
	if (!value) return "en";
	if (isKioskLocale(value)) return value;
	const base = value.split("-")[0]?.toLowerCase();
	return isKioskLocale(base) ? base : "en";
}

// Ensure kiosk locales stay a subset of the app's configured locales.
const _kioskLocalesAreAppLocales: readonly Locale[] = kioskLocales;
void _kioskLocalesAreAppLocales;
