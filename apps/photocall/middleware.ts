import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

export default createMiddleware({
	locales,
	defaultLocale,
	localePrefix: "as-needed",
});

export const config = {
	// Match all pathnames except for API routes, static files, and internal Next.js paths
	matcher: [
		// Match all pathnames except for:
		// - API routes (/api/...)
		// - Static files (/_next/..., /favicon.ico, etc.)
		// - Convex routes
		// - Dashboard and kiosk routes (they don't need i18n for now)
		"/((?!api|_next|_vercel|convex|dashboard|kiosk|share|sign-in|.*\\..*).*)",
	],
};
