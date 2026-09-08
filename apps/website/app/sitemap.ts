import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const posts = getAllPosts();
	// Posts come back newest first, so the first entry dates the blog as a whole.
	const lastPublished = posts.at(0)?.date;
	// Listing a URL is itself a canonicalisation hint, so a post that declares the
	// original elsewhere is left out rather than sending crawlers two signals.
	const ownPosts = posts.filter((post) => !post.originalUrl);

	const postEntries: MetadataRoute.Sitemap = ownPosts.map((post) => ({
		url: absoluteUrl(`/blog/${post.slug}`),
		lastModified: post.date,
		changeFrequency: "yearly",
		priority: 0.6,
	}));

	return [
		{
			// The homepage changes with the site itself, not with the newest post.
			url: siteUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: absoluteUrl("/blog"),
			lastModified: lastPublished,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		...postEntries,
	];
}
