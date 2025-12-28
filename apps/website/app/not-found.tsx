import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
					404
				</h1>
				<h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
				<p className="text-gray-400 mb-8">
					The page you're looking for doesn't exist.
				</p>
				<Link
					href="/"
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
}
