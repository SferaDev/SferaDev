import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { loadGeistFonts, OgCard } from "../../og-card";

export const alt = `A blog post by ${siteConfig.author.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
	return getAllSlugs().map((slug) => ({ slug }));
}

interface OpenGraphImageProps {
	params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	return new ImageResponse(<OgCard eyebrow="Blog" title={post.title} />, {
		...size,
		fonts: await loadGeistFonts(),
	});
}
