import { Footer } from "@/components/footer";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { BlogList } from "./client";

export default function BlogPage() {
	const posts = getAllPosts();
	const tags = getAllTags();

	return (
		<>
			<main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
				<header className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Blog</h1>
					<p className="mt-3 text-pretty text-muted-foreground">
						Posts I have written here and on other publications.
					</p>
				</header>

				<BlogList posts={posts} tags={tags} />
			</main>
			<Footer />
		</>
	);
}
