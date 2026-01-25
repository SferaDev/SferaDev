import { connection } from "next/server";

export async function Footer() {
	await connection();
	return (
		<footer className="py-8 mt-16 md:mt-24 border-t border-border">
			<div className="container text-center text-muted-foreground max-w-5xl">
				<p>&copy; {new Date().getFullYear()} Alexis Rico. All rights reserved.</p>
			</div>
		</footer>
	);
}
