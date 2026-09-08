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

/**
 * A post points outwards for one of two reasons, and they are not interchangeable:
 *
 * - `originalUrl` — this post's text was first published at that URL. The canonical
 *   URL of the page is the original, not us.
 * - `externalUrl` — this post links out to related material (a talk, a video, a
 *   repository) that is not a republication of this text. The page is canonical to
 *   itself.
 *
 * Declaring both would leave the canonical URL ambiguous, so the schema rejects it.
 */
const frontmatterSchema = z
	.object({
		title: z.string().min(1),
		date: postDateSchema,
		description: z.string().optional(),
		originalUrl: z.url().optional(),
		externalUrl: z.url().optional(),
		tags: z.array(z.string()).default([]),
	})
	.refine((frontmatter) => !(frontmatter.originalUrl && frontmatter.externalUrl), {
		message:
			"A post declares either originalUrl (this text was republished from there) or externalUrl (related material), never both.",
		path: ["externalUrl"],
	});

type Frontmatter = z.infer<typeof frontmatterSchema>;

/**
 * The single outbound link a post advertises, resolved from whichever of
 * `originalUrl` / `externalUrl` the frontmatter declared. Derived here so both the
 * server-rendered article and the client-side list read the same value.
 */
export interface OutboundLink {
	url: string;
	host: string;
	kind: "republication" | "related";
}

export interface BlogPost extends Frontmatter {
	slug: string;
	content: string;
	outboundLink: OutboundLink | null;
}

function hostOf(url: string): string {
	return new URL(url).hostname.replace(/^www\./, "");
}

function resolveOutboundLink(frontmatter: Frontmatter): OutboundLink | null {
	if (frontmatter.originalUrl) {
		return {
			url: frontmatter.originalUrl,
			host: hostOf(frontmatter.originalUrl),
			kind: "republication",
		};
	}
	if (frontmatter.externalUrl) {
		return { url: frontmatter.externalUrl, host: hostOf(frontmatter.externalUrl), kind: "related" };
	}
	return null;
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

	return {
		...frontmatter.data,
		slug,
		content: content.trim(),
		outboundLink: resolveOutboundLink(frontmatter.data),
	};
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
