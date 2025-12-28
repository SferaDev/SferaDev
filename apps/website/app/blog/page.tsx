import { getAllPosts, getAllTags } from "@/lib/blog";
import { BlogList } from "./client";

export default function BlogPage() {
	const posts = getAllPosts();
	const tags = getAllTags();

	return (
		<div className="container mx-auto pt-6">
			<BlogList posts={posts} tags={tags} />
		</div>
	);
}
