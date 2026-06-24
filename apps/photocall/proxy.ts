import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

const intlMiddleware = createIntlMiddleware({
	locales,
	defaultLocale,
	localePrefix: "as-needed",
});

const AUTH_PREFIX = "/api/auth";

/**
 * Reverse-proxies `/api/auth/*` to the platform service's `/auth/*` so
 * better-auth handles authentication while cookies remain first-party on the
 * photocall domain.
 *
 * Everything else is handed off to next-intl for locale negotiation on the
 * marketing routes.
 */
export default async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	if (pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)) {
		return proxyToPlatform(request, pathname, search);
	}

	return intlMiddleware(request);
}

async function proxyToPlatform(
	request: NextRequest,
	pathname: string,
	search: string,
): Promise<NextResponse> {
	const platformUrl = process.env.PLATFORM_SERVICE_URL;
	if (!platformUrl) {
		return NextResponse.json({ error: "PLATFORM_SERVICE_URL is not configured" }, { status: 503 });
	}

	const target = new URL(`${pathname.replace(AUTH_PREFIX, "/auth")}${search}`, platformUrl);

	// Forward the request body for non-GET/HEAD methods. Pass the raw stream
	// through so we don't materialize large payloads in memory.
	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers: filterRequestHeaders(request.headers),
		redirect: "manual",
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		init.duplex = "half";
	}

	const platformResponse = await fetch(target, init);

	const responseHeaders = filterResponseHeaders(platformResponse.headers);
	return new NextResponse(platformResponse.body, {
		status: platformResponse.status,
		statusText: platformResponse.statusText,
		headers: responseHeaders,
	});
}

const HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade",
	"content-length",
	// `fetch` transparently decompresses the upstream body, so forwarding the
	// original encoding header would make the browser try to decode plain bytes
	// (→ ERR_CONTENT_DECODING_FAILED). Drop it and let the body go through as-is.
	"content-encoding",
	// Next/edge fetch sets these and they can confuse downstream parsers.
	"host",
]);

function filterRequestHeaders(headers: Headers): Headers {
	const out = new Headers();
	for (const [key, value] of headers) {
		if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
		out.set(key, value);
	}
	return out;
}

function filterResponseHeaders(headers: Headers): Headers {
	const out = new Headers();
	for (const [key, value] of headers) {
		if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
		out.set(key, value);
	}
	return out;
}

export const config = {
	matcher: [
		// Auth proxy
		"/api/auth/:path*",
		// next-intl on marketing routes (excludes API, static, dashboard, kiosk,
		// share, the guest album `/a/*` + `/albums`, the /p short-link redirect, etc.)
		"/((?!api|_next|_vercel|dashboard|kiosk|share|invite|albums|a/|p/|sign-in|.*\\..*).*)",
	],
};
