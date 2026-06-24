"use client";

import { NextIntlClientProvider } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { isRtlLocale } from "@/i18n/config";
import { type KioskLocale, kioskMessages, resolveKioskLocale } from "@/i18n/kiosk-messages";

/**
 * Client-side i18n provider for public, event-branded pages (e.g. the share
 * page) that live outside the next-intl `[locale]` URL segment. The locale is
 * driven by the event itself rather than the URL or browser:
 *
 *   1. `eventLanguage` (the event host's configured language) when present;
 *   2. otherwise the guest's browser language;
 *   3. otherwise English.
 *
 * Messages are bundled statically (the same set the kiosk uses) so the page
 * renders in a fully-translated locale (en/es/ca) with English fallback for
 * anything else. Mirrors {@link KioskI18nProvider} but takes the locale as a
 * prop instead of reading localStorage.
 */
export function EventI18nProvider({
	eventLanguage,
	children,
}: {
	/**
	 * The event's configured language (e.g. "es", "ca", "es-ES"). May be
	 * undefined/null until the events schema gains a `language` column; in that
	 * case we fall back to the guest's browser language.
	 */
	eventLanguage?: string | null;
	children: ReactNode;
}) {
	// The event language is the source of truth and is known on the server, so we
	// can render it immediately. Only fall back to the browser language (a
	// client-only signal) after mount to avoid hydration drift.
	const [locale, setLocale] = useState<KioskLocale>(() =>
		eventLanguage ? resolveKioskLocale(eventLanguage) : "en",
	);

	useEffect(() => {
		if (eventLanguage) {
			setLocale(resolveKioskLocale(eventLanguage));
			return;
		}
		setLocale(resolveKioskLocale(window.navigator.language));
	}, [eventLanguage]);

	return (
		<NextIntlClientProvider locale={locale} messages={kioskMessages[locale]}>
			<div lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} className="contents">
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
