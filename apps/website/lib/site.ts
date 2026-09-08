/**
 * Single source of truth for the site identity: canonical origin, author details
 * and social profiles.
 *
 * Everything that needs an absolute URL — page metadata, the sitemap, robots.txt,
 * the RSS feed and the JSON-LD graphs — resolves against {@link siteUrl}, so the
 * site never advertises two different hosts to crawlers.
 */

/**
 * Canonical origin for the site.
 *
 * The apex is canonical: `www.sferadev.com` redirects here (see `vercel.ts`).
 * Keep this without a trailing slash so {@link absoluteUrl} can compose paths.
 */
export const siteUrl = "https://sferadev.com";

export const siteConfig = {
	/** Short brand used for the site name in OpenGraph and the RSS generator tag. */
	name: "SferaDev",
	/** Default document title, also the fallback for the title template. */
	title: "Alexis Rico - SferaDev",
	description:
		"Portfolio of Alexis Rico, showcasing my work in development, and open source contributions.",
	/** Short summary used on the generated social card, where the author name is already shown. */
	tagline: "Serverless databases, developer tools and type-safe APIs in TypeScript and Go.",
	/** OpenGraph locale for the site; the HTML lang attribute is `en`. */
	locale: "en_US",
	/**
	 * `<meta name="keywords">` terms. Includes the author's own name and handle,
	 * which is appropriate here but NOT in schema.org `knowsAbout` — see
	 * {@link siteConfig.author.knowsAbout}.
	 */
	keywords: [
		"Alexis Rico",
		"SferaDev",
		"TypeScript",
		"Go",
		"Serverless databases",
		"Developer tools",
		"Open source",
	],
	/** Shared description for the blog, used by its page metadata and by llms.txt. */
	blogDescription:
		"Articles by Alexis Rico on serverless databases, TypeScript, open source and developer tooling.",
	author: {
		name: "Alexis Rico",
		jobTitle: "Principal Software Engineer",
		email: "alexis@sferadev.com",
		description:
			"Principal Software Engineer building serverless databases and developer tools. I specialize in TypeScript and Go, creating type-safe APIs and SDKs.",
		/** Profiles linked from JSON-LD via `sameAs`. */
		profiles: ["https://github.com/SferaDev"],
		/**
		 * Subject matter for schema.org `knowsAbout`. Deliberately separate from
		 * {@link siteConfig.keywords}: `knowsAbout` states what a person knows about,
		 * so listing their own name there is both wrong and reads as keyword stuffing.
		 */
		knowsAbout: [
			"TypeScript",
			"Go",
			"PostgreSQL",
			"Serverless databases",
			"Developer tools",
			"API design",
			"OpenAPI",
			"Open source",
		],
		worksFor: { name: "Xata", url: "https://xata.io" },
		/** Company the author runs alongside their employment; surfaced in JSON-LD. */
		founderOf: {
			name: "sferarc",
			url: "https://pgbeam.com",
			description: "Developer tooling company.",
		},
	},
};

/** Path of the RSS feed, served by `app/feed.xml/route.ts`. */
export const feedPath = "/feed.xml";

/**
 * `alternates.types` entry that advertises the RSS feed via `<link rel="alternate">`.
 *
 * Next.js replaces the whole `alternates` object when a page overrides it, so every
 * page that sets its own canonical spreads this in to keep feed autodiscovery.
 */
export const feedAlternateTypes = { "application/rss+xml": feedPath };

/** Resolves a site-relative path against the canonical origin. */
export function absoluteUrl(path: string): string {
	return new URL(path, siteUrl).toString();
}
