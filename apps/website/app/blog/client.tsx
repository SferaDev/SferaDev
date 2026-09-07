"use client";

import Link from "next/link";
import { useState } from "react";

import type { BlogPost, OutboundLink } from "@/lib/blog";

interface BlogListProps {
	posts: BlogPost[];
	tags: string[];
}

const filterBase = "rounded-md border px-3 py-1.5 font-mono text-xs motion-safe:transition-colors";
const filterSelected = "border-brand bg-accent text-brand";
const filterIdle = "border-border bg-card text-muted-foreground hover:text-foreground";

/** A republished post credits where its text came from; a link post just points outwards. */
const outboundLinkLabel = {
	republication: "Originally on",
	related: "View on",
} as const satisfies Record<OutboundLink["kind"], string>;

export function BlogList({ posts, tags }: BlogListProps) {
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	const filteredPosts = selectedTag
		? posts.filter((post) => post.tags.includes(selectedTag))
		: posts;

	return (
		<div>
			{/* Every post is rendered server-side; the filter is a progressive enhancement. */}
			<nav aria-label="Filter posts by tag" className="mb-8 flex flex-wrap gap-2">
				<button
					type="button"
					aria-pressed={selectedTag === null}
					onClick={() => setSelectedTag(null)}
					className={`${filterBase} ${selectedTag === null ? filterSelected : filterIdle}`}
				>
					All posts ({posts.length})
				</button>
				{tags.map((tag) => {
					const count = posts.filter((post) => post.tags.includes(tag)).length;
					return (
						<button
							key={tag}
							type="button"
							aria-pressed={selectedTag === tag}
							onClick={() => setSelectedTag(tag)}
							className={`${filterBase} ${selectedTag === tag ? filterSelected : filterIdle}`}
						>
							{tag} ({count})
						</button>
					);
				})}
			</nav>

			<ul className="space-y-4">
				{filteredPosts.map((post) => {
					const outbound = post.outboundLink;
					return (
						<li key={post.slug}>
							<article className="rounded-lg border border-border bg-card p-4 motion-safe:transition-colors hover:border-brand sm:p-5">
								<h2 className="text-lg font-semibold leading-snug">
									<Link
										href={`/blog/${post.slug}`}
										className="text-card-foreground motion-safe:transition-colors hover:text-brand"
									>
										{post.title}
									</Link>
								</h2>

								{post.description && (
									<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
										{post.description}
									</p>
								)}

								<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted-foreground">
									<time dateTime={post.date.toISOString()}>
										{post.date.toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											timeZone: "UTC",
										})}
									</time>
									{outbound && (
										<span>
											{outboundLinkLabel[outbound.kind]} {outbound.host}
										</span>
									)}
									{post.tags.map((tag) => (
										<span key={tag} className="rounded-sm bg-muted px-2 py-0.5">
											{tag}
										</span>
									))}
								</div>
							</article>
						</li>
					);
				})}
			</ul>

			{filteredPosts.length === 0 && (
				<p className="py-12 text-center text-muted-foreground">
					No posts tagged &ldquo;{selectedTag}&rdquo;.
				</p>
			)}
		</div>
	);
}
