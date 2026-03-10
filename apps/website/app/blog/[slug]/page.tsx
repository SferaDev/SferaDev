import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileBlogPost, getAllSlugs, getPostBySlug } from "@/lib/blog";

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

	const content = await compileBlogPost(post.content);

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

					<h1 className="text-2xl md:text-3xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
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
					{content}
				</article>
			</div>
		</div>
	);
}
