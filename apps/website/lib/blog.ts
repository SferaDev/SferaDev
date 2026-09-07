import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const postsDirectory = path.join(process.cwd(), "content/blog");

/**
 * YAML gives us the post date in one of two shapes: a quoted string such as
 * `"2025-12-02"` stays a string, while a bare `2023-09-21` is parsed by the YAML
 * spec as a timestamp and reaches us as a `Date`. Accept both and always hand a
 * `Date` back to callers.
 */
const postDateSchema = z.union([z.date(), z.iso.date().transform((value) => new Date(value))]);

const frontmatterSchema = z.object({
	title: z.string().min(1),
	date: postDateSchema,
	description: z.string().optional(),
	originalUrl: z.url().optional(),
	tags: z.array(z.string()).default([]),
});

type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface BlogPost extends Frontmatter {
	slug: string;
	content: string;
}

function isPostFile(fileName: string): boolean {
	return fileName.endsWith(".mdx");
}

function readPost(slug: string): BlogPost {
	const fileName = `${slug}.mdx`;
	const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
	const { data, content } = matter(fileContents);

	const frontmatter = frontmatterSchema.safeParse(data);
	if (!frontmatter.success) {
		throw new Error(`Invalid frontmatter in ${fileName}:\n${z.prettifyError(frontmatter.error)}`);
	}

	return { ...frontmatter.data, slug, content: content.trim() };
}

export function getAllSlugs(): string[] {
	return fs
		.readdirSync(postsDirectory)
		.filter(isPostFile)
		.map((fileName) => fileName.replace(/\.mdx$/, ""));
}

export function getAllPosts(): BlogPost[] {
	return getAllSlugs()
		.map(readPost)
		.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
	// Guard against arbitrary slugs from the dynamic route reaching the filesystem.
	if (!getAllSlugs().includes(slug)) return null;
	return readPost(slug);
}

export function getAllTags(): string[] {
	const allTags = getAllPosts().flatMap((post) => post.tags);
	return [...new Set(allTags)].sort();
}
