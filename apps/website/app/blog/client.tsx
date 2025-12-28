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
			<div className="w-64 flex-shrink-0">
				<div className="sticky top-24">
					<h2 className="text-lg font-semibold mb-4 text-gray-100">Filter by Tag</h2>
					<div className="space-y-2">
						<button
							type="button"
							onClick={() => setSelectedTag(null)}
							className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
								selectedTag === null
									? "bg-blue-900 text-blue-100"
									: "text-gray-400 hover:bg-gray-800"
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
											? "bg-blue-900 text-blue-100"
											: "text-gray-400 hover:bg-gray-800"
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
							className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors bg-gray-900"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Link
											href={post.originalUrl || `/blog/${post.slug}`}
											className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition-colors"
											{...(post.originalUrl && {
												target: "_blank",
												rel: "noopener noreferrer",
											})}
										>
											{post.title}
										</Link>
										{post.originalUrl && <ExternalLink className="w-4 h-4 text-gray-400" />}
									</div>

									{post.description && (
										<p className="text-gray-400 text-sm mb-2 line-clamp-2">{post.description}</p>
									)}

									<div className="flex items-center gap-4 text-xs">
										<time className="text-gray-500">
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
														className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs"
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
						<p className="text-gray-400">No posts found for tag "{selectedTag}".</p>
					</div>
				)}
			</div>
		</div>
	);
}
