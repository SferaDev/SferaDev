"use client";

import { NextIntlClientProvider } from "next-intl";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { isRtlLocale } from "@/i18n/config";
import { type KioskLocale, kioskMessages, resolveKioskLocale } from "@/i18n/kiosk-messages";

/** localStorage key the guest's chosen kiosk language is persisted under. */
export const KIOSK_LOCALE_STORAGE_KEY = "photocall:locale";

interface KioskLocaleContextValue {
	locale: KioskLocale;
	setLocale: (locale: KioskLocale) => void;
}

const KioskLocaleContext = createContext<KioskLocaleContextValue | null>(null);

/**
 * Exposes the current kiosk locale and a setter that persists the choice. Used
 * by the guest language picker.
 */
export function useKioskLocale(): KioskLocaleContextValue {
	const context = useContext(KioskLocaleContext);
	if (!context) {
		throw new Error("useKioskLocale must be used within a KioskI18nProvider");
	}
	return context;
}

/**
 * Client-side i18n provider for the kiosk subtree. The kiosk is intentionally
 * excluded from the next-intl middleware (no URL locale prefixes), so the
 * locale is chosen on the client and persisted in localStorage. Messages are
 * bundled statically (see `i18n/kiosk-messages.ts`) so the kiosk keeps its
 * language while offline.
 */
export function KioskI18nProvider({ children }: { children: ReactNode }) {
	// Start from the default so server and first client render match; the
	// persisted/browser locale is applied after mount to avoid hydration drift.
	const [locale, setLocaleState] = useState<KioskLocale>("en");

	useEffect(() => {
		const stored = window.localStorage.getItem(KIOSK_LOCALE_STORAGE_KEY);
		const initial = stored
			? resolveKioskLocale(stored)
			: resolveKioskLocale(window.navigator.language);
		setLocaleState(initial);
	}, []);

	const setLocale = useCallback((next: KioskLocale) => {
		setLocaleState(next);
		window.localStorage.setItem(KIOSK_LOCALE_STORAGE_KEY, next);
	}, []);

	const contextValue = useMemo<KioskLocaleContextValue>(
		() => ({ locale, setLocale }),
		[locale, setLocale],
	);

	return (
		<KioskLocaleContext.Provider value={contextValue}>
			<NextIntlClientProvider locale={locale} messages={kioskMessages[locale]}>
				<div lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} className="contents">
					{children}
				</div>
			</NextIntlClientProvider>
		</KioskLocaleContext.Provider>
	);
}
