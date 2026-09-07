import { Feed } from "feed";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, feedPath, siteConfig, siteUrl } from "@/lib/site";

// The posts are read from the filesystem at build time, so the feed can be
// prerendered instead of being rebuilt on every request.
export const dynamic = "force-static";

const feedAuthor = {
	name: siteConfig.author.name,
	email: siteConfig.author.email,
	link: siteUrl,
};

export function GET(): Response {
	const posts = getAllPosts();

	const feed = new Feed({
		id: absoluteUrl("/blog"),
		link: absoluteUrl("/blog"),
		title: `${siteConfig.author.name} — Blog`,
		description: siteConfig.description,
		language: "en",
		copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
		updated: posts.at(0)?.date,
		image: absoluteUrl("/profile.png"),
		favicon: absoluteUrl("/favicon.ico"),
		feedLinks: { rss: absoluteUrl(feedPath) },
		author: feedAuthor,
	});

	for (const post of posts) {
		feed.addItem({
			title: post.title,
			id: absoluteUrl(`/blog/${post.slug}`),
			link: absoluteUrl(`/blog/${post.slug}`),
			description: post.description ?? post.excerpt,
			date: post.date,
			category: post.tags.map((name) => ({ name })),
			author: [feedAuthor],
		});
	}

	return new Response(feed.rss2(), {
		headers: { "content-type": "application/rss+xml; charset=utf-8" },
	});
}
