import type { BlogPosting, Graph, Thing, WithContext } from "schema-dts";
import type { BlogPost } from "@/lib/blog";
import { absoluteUrl, siteConfig, siteUrl } from "@/lib/site";

/** Stable node identifiers so the same entities are recognised across pages. */
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;
const blogId = `${siteUrl}/blog#blog`;

/**
 * Author node, repeated on every page that needs it.
 *
 * Article pages have to carry their own copy — a bare `@id` reference would
 * dangle because the full node only exists in the homepage graph.
 */
const authorNode = {
	"@type": "Person",
	"@id": personId,
	name: siteConfig.author.name,
	url: absoluteUrl("/"),
} as const;

interface JsonLdProps {
	schema: Graph | WithContext<Thing>;
}

/**
 * Renders a structured-data payload as an `application/ld+json` script.
 *
 * The JSON has to be injected as raw HTML — React would HTML-escape it as text
 * content and break parsers — so `<` is escaped to keep the payload from ending
 * the script element early.
 */
export function JsonLd({ schema }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
		/>
	);
}

/** Identity graph for the homepage: who the site is about and what it is. */
export function personGraph(): Graph {
	const { author } = siteConfig;

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Person",
				"@id": personId,
				name: author.name,
				alternateName: siteConfig.name,
				url: absoluteUrl("/"),
				image: absoluteUrl("/opengraph-image"),
				email: author.email,
				jobTitle: author.jobTitle,
				description: author.description,
				sameAs: author.profiles,
				knowsAbout: siteConfig.keywords,
				worksFor: { "@type": "Organization", name: author.worksFor.name, url: author.worksFor.url },
			},
			{
				"@type": "WebSite",
				"@id": websiteId,
				url: absoluteUrl("/"),
				name: siteConfig.title,
				description: siteConfig.description,
				inLanguage: "en",
				publisher: { "@id": personId },
				about: { "@id": personId },
			},
		],
	};
}

/**
 * Article markup for a blog post.
 *
 * Republished posts carry an `originalUrl`; the same URL is used for the
 * canonical link and for `mainEntityOfPage` so both signals agree on where the
 * article really lives.
 */
export function blogPostingSchema(post: BlogPost): WithContext<BlogPosting> {
	const postUrl = absoluteUrl(`/blog/${post.slug}`);
	const canonicalUrl = post.originalUrl ?? postUrl;
	const publishedAt = new Date(post.date).toISOString();

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description ?? post.excerpt,
		url: postUrl,
		mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
		image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
		datePublished: publishedAt,
		dateModified: publishedAt,
		keywords: post.tags,
		inLanguage: "en",
		author: authorNode,
		publisher: authorNode,
		isPartOf: {
			"@type": "Blog",
			"@id": blogId,
			name: `${siteConfig.author.name} — Blog`,
			url: absoluteUrl("/blog"),
		},
	};
}
