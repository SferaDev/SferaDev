export function Footer() {
	return (
		<footer className="py-8 mt-16 md:mt-24 border-t border-gray-800">
			<div className="container text-center text-gray-500 max-w-5xl">
				<p>
					&copy; {new Date().getFullYear()} Alexis Rico. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
