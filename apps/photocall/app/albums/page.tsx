import { Camera } from "lucide-react";
import Link from "next/link";
import { MyAlbums } from "@/components/my-albums";

export default function MyAlbumsPage() {
	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			<header className="border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<Link href="/" className="flex items-center gap-2">
						<Camera className="h-6 w-6 text-rose-500" />
						<span className="text-xl font-bold">Photocall</span>
					</Link>
				</div>
			</header>

			<main className="py-8">
				<div className="container mx-auto px-4">
					<h1 className="mx-auto mb-4 max-w-3xl text-2xl font-bold">Your albums</h1>
				</div>
				<MyAlbums showEmpty />
			</main>
		</div>
	);
}
