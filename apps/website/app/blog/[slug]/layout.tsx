import type React from "react";
import { getPostBySlug } from "@/lib/blog";
import { blogPostingSchema, JsonLd } from "../../json-ld";

interface BlogPostLayoutProps {
	children: React.ReactNode;
	params: Promise<{ slug: string }>;
}

/**
 * Adds `BlogPosting` structured data around every article.
 *
 * It lives in the layout rather than the page so the markup of the post itself
 * stays purely presentational.
 */
export default async function BlogPostLayout({ children, params }: BlogPostLayoutProps) {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	return (
		<>
			{post ? <JsonLd schema={blogPostingSchema(post)} /> : null}
			{children}
		</>
	);
}
