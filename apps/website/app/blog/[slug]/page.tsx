import rehypeShiki from "@shikijs/rehype";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

interface BlogPostPageProps {
	params: Promise<{
		slug: string;
	}>;
}

/**
 * Dual themes emit both palettes as CSS variables on every token instead of a hard-coded
 * colour, so the same static HTML works in light and dark mode. `defaultColor: false`
 * keeps Shiki from also writing an inline `color`, which would win over our stylesheet.
 */
const shikiOptions = {
	themes: { light: "github-light", dark: "github-dark" },
	defaultColor: false,
} as const;

/** Applies the variables Shiki wrote, and wins over `prose`'s own `pre`/`code` colours. */
const shikiStyles = `
.shiki, .shiki code, .shiki span {
	color: var(--shiki-light) !important;
	background-color: var(--shiki-light-bg, transparent) !important;
}
.dark .shiki, .dark .shiki code, .dark .shiki span {
	color: var(--shiki-dark) !important;
	background-color: var(--shiki-dark-bg, transparent) !important;
}
`;

export async function generateStaticParams() {
	return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	const originalHost = post.originalUrl
		? new URL(post.originalUrl).hostname.replace(/^www\./, "")
		: null;

	return (
		<>
			<style href="shiki-dual-theme" precedence="default">
				{shikiStyles}
			</style>

			<main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
				<Link
					href="/blog"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Back to blog
				</Link>

				<header className="mt-8 mb-10 border-b border-border pb-8">
					<h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
						{post.title}
					</h1>

					{post.description && (
						<p className="mt-4 text-pretty text-lg text-muted-foreground">{post.description}</p>
					)}

					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
						<time
							dateTime={post.date.toISOString()}
							className="font-mono text-sm text-muted-foreground"
						>
							{post.date.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								timeZone: "UTC",
							})}
						</time>
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
							>
								{tag}
							</span>
						))}
					</div>

					{post.originalUrl && originalHost && (
						<p className="mt-6 text-sm text-muted-foreground">
							Originally published on{" "}
							<a
								href={post.originalUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-brand underline underline-offset-4 hover:no-underline"
							>
								{originalHost}
								<ExternalLink className="size-3.5" aria-hidden="true" />
							</a>
						</p>
					)}
				</header>

				{post.content && (
					<article
						className={[
							"prose prose-neutral dark:prose-invert max-w-none",
							"prose-a:text-brand prose-a:underline-offset-4",
							"prose-pre:rounded-lg prose-pre:border prose-pre:border-border",
							// `prose-code:` also matches the `code` inside a highlighted `pre`, so the
							// inline-code chrome is scoped to code that is not inside a `pre`.
							"prose-code:before:content-none prose-code:after:content-none",
							"[&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-muted",
							"[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-normal",
						].join(" ")}
					>
						<MarkdownAsync
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[[rehypeShiki, shikiOptions]]}
						>
							{post.content}
						</MarkdownAsync>
					</article>
				)}
			</main>
		</>
	);
}
