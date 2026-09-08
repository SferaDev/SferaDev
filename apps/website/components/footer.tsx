import { personalInfo } from "@/lib/data";

/**
 * Deliberately carries no year. The page is statically prerendered, so any year
 * rendered here would be the one stamped at build time and would silently go
 * stale the moment the site is not rebuilt across a new year.
 */
export function Footer() {
	return (
		<footer className="py-8 mt-16 md:mt-24 border-t border-border">
			<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 text-center text-muted-foreground">
				<p>&copy; {personalInfo.name}. All rights reserved.</p>
			</div>
		</footer>
	);
}
