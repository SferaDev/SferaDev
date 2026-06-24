import { getRequestConfig } from "next-intl/server";
import { type Locale, locales } from "./config";
import enMessages from "./messages/en.json";

type Messages = { [key: string]: string | string[] | Messages };

/**
 * Deep-merge a locale's messages over the English base so any key a locale
 * doesn't define falls back to English. Most locales ship as partial
 * "stub" translations (e.g. only the marketing/landing namespaces), so without
 * this they throw MISSING_MESSAGE for namespaces like `legal` that only exist
 * in the fully-translated locales (en/es/ca).
 */
function mergeMessages(base: Messages, override: Messages): Messages {
	const result: Messages = { ...base };
	for (const [key, value] of Object.entries(override)) {
		const baseValue = result[key];
		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			baseValue &&
			typeof baseValue === "object" &&
			!Array.isArray(baseValue)
		) {
			result[key] = mergeMessages(baseValue, value);
		} else {
			result[key] = value;
		}
	}
	return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	// Validate that the incoming locale is valid
	if (!locale || !locales.includes(locale as Locale)) {
		locale = "en";
	}

	const messages =
		locale === "en"
			? enMessages
			: mergeMessages(
					enMessages as Messages,
					(await import(`./messages/${locale}.json`)).default as Messages,
				);

	// A default timeZone keeps next-intl date/time formatting deterministic
	// between server and client (otherwise it warns ENVIRONMENT_FALLBACK and
	// risks a hydration mismatch).
	return { locale, messages, timeZone: "Europe/Madrid" };
});
