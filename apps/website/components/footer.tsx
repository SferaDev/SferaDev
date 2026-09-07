import { personalInfo } from "@/lib/data";

/**
 * Rendered at build time. Deliberately avoids `connection()` so the homepage stays
 * static; the copyright year is stamped when the site is built.
 */
const year = new Date().getFullYear();

export function Footer() {
	return (
		<footer className="py-8 mt-16 md:mt-24 border-t border-border">
			<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 text-center text-muted-foreground">
				<p>
					&copy; {year} {personalInfo.name}. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
