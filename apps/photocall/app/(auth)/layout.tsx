import type { ReactNode } from "react";
import { AuthBranding } from "@/components/auth/auth-branding";
import { DashboardI18nProvider } from "@/components/dashboard-i18n-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<DashboardI18nProvider>
			<AuthBranding>{children}</AuthBranding>
		</DashboardI18nProvider>
	);
}
