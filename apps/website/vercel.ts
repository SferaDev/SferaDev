import { matchers, type Redirect, routes, type VercelConfig } from "@vercel/config/v1";

const branch = process.env.VERCEL_GIT_COMMIT_REF;
const prodHost = "sferadev.mintlify.app";
async function getDocsHost() {
	const previewHost = `sferadev-${branch}.mintlify.app`;
	const res = await fetch(`https://${previewHost}/docs`, { method: "HEAD" }).catch(() => null);
	return res?.ok ? previewHost : prodHost;
}

const docsHost = await getDocsHost();

/**
 * Canonical origin. Vercel loads this file with Node's TypeScript support, which
 * cannot resolve extensionless relative imports, so the value is repeated here
 * rather than imported — keep it in sync with `siteUrl` in `lib/site.ts`.
 */
const siteUrl = "https://sferadev.com";
const canonicalHost = new URL(siteUrl).host;

/**
 * The apex is the canonical host, so `www` is redirected onto it and never serves
 * a second, competing copy of the site.
 *
 * Redirects are evaluated before rewrites, so `www.sferadev.com/docs` lands on the
 * apex first and is then rewritten to Mintlify like any other apex request.
 *
 * Declared against the package's `Redirect` type rather than through
 * `routes.redirect()`, whose return type widens to `Redirect | Route` as soon as
 * options are passed and no longer fits `VercelConfig["redirects"]`.
 */
const wwwToApex: Redirect = {
	source: "/:path*",
	destination: `${siteUrl}/:path*`,
	permanent: true,
	has: [matchers.host(`www.${canonicalHost}`)],
};

export const config: VercelConfig = {
	redirects: [wwwToApex],
	rewrites: [
		routes.rewrite("/docs", `https://${docsHost}/docs`),
		routes.rewrite("/docs/:path*", `https://${docsHost}/docs/:path*`),
		routes.rewrite("/_mintlify/:path*", `https://${docsHost}/_mintlify/:path*`),
		routes.rewrite("/api/request", `https://${docsHost}/_mintlify/api/request`),
		routes.rewrite("/docs/llms.txt", `https://${docsHost}/llms.txt`),
		routes.rewrite("/docs/llms-full.txt", `https://${docsHost}/llms-full.txt`),
		routes.rewrite("/docs/sitemap.xml", `https://${docsHost}/sitemap.xml`),
		routes.rewrite("/docs/robots.txt", `https://${docsHost}/robots.txt`),
		routes.rewrite("/docs/mcp", `https://${docsHost}/mcp`),
		routes.rewrite("/mintlify-assets/:path+", `https://${docsHost}/mintlify-assets/:path+`),
	],
};
