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
import {
	type DashboardLocale,
	dashboardMessages,
	resolveDashboardLocale,
} from "@/i18n/dashboard-messages";

/** localStorage key the operator's chosen dashboard language is persisted under. */
export const DASHBOARD_LOCALE_STORAGE_KEY = "photocall:admin-locale";

interface DashboardLocaleContextValue {
	locale: DashboardLocale;
	setLocale: (locale: DashboardLocale) => void;
}

const DashboardLocaleContext = createContext<DashboardLocaleContextValue | null>(null);

/**
 * Exposes the current dashboard locale and a setter that persists the choice.
 * Used by the dashboard language picker.
 */
export function useDashboardLocale(): DashboardLocaleContextValue {
	const context = useContext(DashboardLocaleContext);
	if (!context) {
		throw new Error("useDashboardLocale must be used within a DashboardI18nProvider");
	}
	return context;
}

/**
 * Client-side i18n provider for the admin dashboard subtree. Like the kiosk, the
 * dashboard is excluded from the next-intl middleware (no URL locale prefixes),
 * so the locale is chosen on the client and persisted in localStorage. Messages
 * are bundled statically (see `i18n/dashboard-messages.ts`).
 */
export function DashboardI18nProvider({ children }: { children: ReactNode }) {
	// Start from the default so server and first client render match; the
	// persisted/browser locale is applied after mount to avoid hydration drift.
	const [locale, setLocaleState] = useState<DashboardLocale>("en");

	useEffect(() => {
		const stored = window.localStorage.getItem(DASHBOARD_LOCALE_STORAGE_KEY);
		const initial = stored
			? resolveDashboardLocale(stored)
			: resolveDashboardLocale(window.navigator.language);
		setLocaleState(initial);
	}, []);

	const setLocale = useCallback((next: DashboardLocale) => {
		setLocaleState(next);
		window.localStorage.setItem(DASHBOARD_LOCALE_STORAGE_KEY, next);
	}, []);

	const contextValue = useMemo<DashboardLocaleContextValue>(
		() => ({ locale, setLocale }),
		[locale, setLocale],
	);

	return (
		<DashboardLocaleContext.Provider value={contextValue}>
			<NextIntlClientProvider locale={locale} messages={dashboardMessages[locale]}>
				<div lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} className="contents">
					{children}
				</div>
			</NextIntlClientProvider>
		</DashboardLocaleContext.Provider>
	);
}
