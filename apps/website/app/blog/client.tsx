"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { BlogPost } from "@/lib/blog";

interface BlogClientWrapperProps {
	posts: BlogPost[];
	tags: string[];
}

export function BlogList({ posts, tags }: BlogClientWrapperProps) {
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	const filteredPosts = selectedTag
		? posts.filter((post) => post.tags.includes(selectedTag))
		: posts;

	return (
		<div className="flex gap-8">
			<div className="w-64 shrink-0">
				<div className="sticky top-24">
					<h2 className="text-lg font-semibold mb-4 text-foreground">Filter by Tag</h2>
					<div className="space-y-2">
						<button
							type="button"
							onClick={() => setSelectedTag(null)}
							className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
								selectedTag === null
									? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
									: "text-muted-foreground hover:bg-muted"
							}`}
						>
							All Posts ({posts.length})
						</button>
						{tags.map((tag) => {
							const count = posts.filter((post) => post.tags.includes(tag)).length;
							return (
								<button
									key={tag}
									type="button"
									onClick={() => setSelectedTag(tag)}
									className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
										selectedTag === tag
											? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
											: "text-muted-foreground hover:bg-muted"
									}`}
								>
									{tag} ({count})
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="flex-1">
				<div className="space-y-3">
					{filteredPosts.map((post) => (
						<article
							key={post.slug}
							className="border border-border rounded-lg p-4 hover:border-muted-foreground/50 transition-colors bg-card"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Link
											href={post.originalUrl || `/blog/${post.slug}`}
											className="text-lg font-semibold text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
											{...(post.originalUrl && {
												target: "_blank",
												rel: "noopener noreferrer",
											})}
										>
											{post.title}
										</Link>
										{post.originalUrl && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
									</div>

									{post.description && (
										<p className="text-muted-foreground text-sm mb-2 line-clamp-2">
											{post.description}
										</p>
									)}

									<div className="flex items-center gap-4 text-xs">
										<time className="text-muted-foreground/70">
											{new Date(post.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</time>
										{post.tags.length > 0 && (
											<div className="flex gap-1">
												{post.tags.map((tag) => (
													<span
														key={tag}
														className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
													>
														{tag}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						</article>
					))}
				</div>

				{filteredPosts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No posts found for tag "{selectedTag}".</p>
					</div>
				)}
			</div>
		</div>
	);
}
