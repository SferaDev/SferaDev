import type { ReactNode } from "react";
import { DashboardI18nProvider } from "@/components/dashboard-i18n-provider";

/**
 * Dashboard layout. Wraps the whole admin surface in {@link DashboardI18nProvider}
 * so every dashboard screen renders in the operator's chosen language. The
 * dashboard is excluded from the next-intl middleware (no URL locale prefixes);
 * the locale is chosen on the client and persisted in localStorage, with
 * messages bundled statically.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <DashboardI18nProvider>{children}</DashboardI18nProvider>;
}
