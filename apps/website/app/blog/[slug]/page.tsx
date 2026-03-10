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
		<div className="pt-16 pb-24">
			<div className="container mx-auto px-6 max-w-3xl">
				<Link
					href="/blog"
					className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-10"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					Back to Blog
				</Link>

				<header className="mb-10">
					<div className="flex flex-wrap gap-2 mb-4">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
							>
								{tag}
							</span>
						))}
					</div>

					<h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight tracking-tight">
						{post.title}
					</h1>

					<p className="text-gray-500 dark:text-gray-400 text-sm">
						{new Date(post.date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</header>

				<div className="h-px bg-gray-200 dark:bg-gray-800 mb-10" />

				<article className="prose prose-gray dark:prose-invert prose-base max-w-none prose-headings:tracking-tight">
					{content}
				</article>
			</div>
		</div>
	);
}
