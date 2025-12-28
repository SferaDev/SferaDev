import { ArrowLeft } from "lucide-react";
import Markdown from "markdown-to-jsx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

interface BlogPostPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	return (
		<div className="pt-16 pb-20">
			<div className="container mx-auto px-6 max-w-3xl">
				<div className="mb-8">
					<Link
						href="/blog"
						className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Blog
					</Link>

					<h1 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
						{post.title}
					</h1>

					<div className="flex items-center gap-4 mb-6">
						<p className="text-gray-500 dark:text-gray-400 text-sm">
							{new Date(post.date).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>

					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-8">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				<article className="prose prose-gray dark:prose-invert prose-base max-w-none">
					<Markdown
						options={{
							overrides: {
								h1: {
									props: {
										className:
											"text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 leading-tight",
									},
								},
								h2: {
									props: {
										className:
											"text-xl font-bold text-gray-900 dark:text-white mb-3 mt-6 leading-tight",
									},
								},
								h3: {
									props: {
										className:
											"text-lg font-bold text-gray-900 dark:text-white mb-2 mt-5 leading-tight",
									},
								},
								p: {
									props: {
										className:
											"text-gray-700 dark:text-gray-300 mb-4 leading-relaxed",
									},
								},
								a: {
									props: {
										className:
											"text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline",
									},
								},
								code: {
									props: {
										className:
											"bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono",
									},
								},
								pre: {
									props: {
										className:
											"bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 overflow-x-auto mb-6 text-sm",
									},
								},
								ul: {
									props: {
										className:
											"list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1 leading-relaxed",
									},
								},
								ol: {
									props: {
										className:
											"list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1 leading-relaxed",
									},
								},
								li: {
									props: {
										className:
											"text-gray-700 dark:text-gray-300 leading-relaxed",
									},
								},
								strong: {
									props: {
										className: "font-semibold text-gray-900 dark:text-white",
									},
								},
								blockquote: {
									props: {
										className:
											"border-l-4 border-blue-200 dark:border-blue-800 pl-4 italic text-gray-600 dark:text-gray-400 mb-4",
									},
								},
							},
						}}
					>
						{post.content}
					</Markdown>
				</article>
			</div>
		</div>
	);
}
