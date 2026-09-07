import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, feedPath, siteConfig } from "@/lib/site";

// Built from filesystem content, so it can be prerendered like the other feeds.
export const dynamic = "force-static";

/**
 * `/llms.txt` — a Markdown index of the site for large language models.
 *
 * See https://llmstxt.org. The docs section publishes its own `/docs/llms.txt`
 * from Mintlify; this one covers the portfolio and the blog.
 */
export function GET(): Response {
	const posts = getAllPosts();

	const body = [
		`# ${siteConfig.author.name}`,
		"",
		`> ${siteConfig.author.description}`,
		"",
		"## Pages",
		"",
		`- [Home](${absoluteUrl("/")}): ${siteConfig.description}`,
		`- [Blog](${absoluteUrl("/blog")}): Articles about databases, TypeScript and developer tooling.`,
		`- [Docs](${absoluteUrl("/docs")}): Project documentation.`,
		`- [RSS feed](${absoluteUrl(feedPath)}): Blog posts as RSS.`,
		"",
		"## Blog posts",
		"",
		...posts.map((post) => {
			const summary = post.description;
			return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${summary ? `: ${summary}` : ""}`;
		}),
		"",
	].join("\n");

	return new Response(body, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
