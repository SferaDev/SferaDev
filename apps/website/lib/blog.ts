import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
	slug: string;
	title: string;
	date: Date;
	excerpt: string;
	description?: string;
	originalUrl?: string;
	tags: string[];
	content: string;
}

export function getAllPosts(): BlogPost[] {
	const fileNames = fs.readdirSync(postsDirectory);
	const allPostsData = fileNames
		.filter((name) => name.endsWith(".mdx"))
		.map((fileName) => {
			const slug = fileName.replace(/\.mdx$/, "");
			const fullPath = path.join(postsDirectory, fileName);
			const fileContents = fs.readFileSync(fullPath, "utf8");
			const { data, content } = matter(fileContents);

			return {
				slug,
				title: data.title || "",
				date: new Date(data.date || ""),
				excerpt: data.excerpt || "",
				description: data.description,
				originalUrl: data.originalUrl,
				tags: data.tags || [],
				content,
			};
		});

	return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
	try {
		const fullPath = path.join(postsDirectory, `${slug}.mdx`);
		const fileContents = fs.readFileSync(fullPath, "utf8");
		const { data, content } = matter(fileContents);

		return {
			slug,
			title: data.title || "",
			date: data.date || "",
			excerpt: data.excerpt || "",
			description: data.description,
			originalUrl: data.originalUrl,
			tags: data.tags || [],
			content,
		};
	} catch {
		return null;
	}
}

export function getAllSlugs(): string[] {
	const fileNames = fs.readdirSync(postsDirectory);
	return fileNames
		.filter((name) => name.endsWith(".mdx"))
		.map((fileName) => fileName.replace(/\.mdx$/, ""));
}

export function getAllTags(): string[] {
	const posts = getAllPosts();
	const allTags = posts.flatMap((post) => post.tags);
	return [...new Set(allTags)].sort();
}
