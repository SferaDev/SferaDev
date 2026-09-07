import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const posts = getAllPosts();
	// Posts come back newest first, so the first entry dates the blog as a whole.
	const lastPublished = posts.at(0)?.date;

	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: absoluteUrl(`/blog/${post.slug}`),
		lastModified: post.date,
		changeFrequency: "yearly",
		priority: 0.6,
	}));

	return [
		{
			url: absoluteUrl("/"),
			lastModified: lastPublished,
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
