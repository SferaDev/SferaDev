import { Camera, ChevronLeft } from "lucide-react";
import Link from "next/link";

/** A single titled section of legal copy. */
export type LegalSection = {
	heading: string;
	/** Paragraphs of body text, rendered in order. */
	body: string[];
};

type LegalPageProps = {
	title: string;
	/** Pre-formatted "Last updated …" line. */
	lastUpdated: string;
	/** Label for the back-to-home link. */
	backLabel: string;
	/** Short note clarifying these are templates pending legal review. */
	disclaimer: string;
	sections: LegalSection[];
};

/**
 * Shared chrome for the marketing legal pages (privacy / terms). Presentational
 * only — the server pages resolve all copy (localized title/labels + the section
 * content) and pass it in.
 */
export function LegalPage({ title, lastUpdated, backLabel, disclaimer, sections }: LegalPageProps) {
	return (
		<div className="min-h-screen bg-linear-to-b from-rose-50 to-white dark:from-rose-950 dark:to-background">
			<header className="container mx-auto px-4 py-6">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
				>
					<ChevronLeft className="h-5 w-5" />
					<Camera className="h-6 w-6 text-rose-500" />
					<span className="font-bold">{backLabel}</span>
				</Link>
			</header>

			<main className="container mx-auto max-w-3xl px-4 pb-20">
				<h1 className="mb-2 text-4xl font-bold tracking-tight">{title}</h1>
				<p className="mb-8 text-sm text-muted-foreground">{lastUpdated}</p>

				<p className="mb-10 rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
					{disclaimer}
				</p>

				<div className="space-y-8">
					{sections.map((section) => (
						<section key={section.heading}>
							<h2 className="mb-3 text-xl font-semibold">{section.heading}</h2>
							{section.body.map((paragraph) => (
								<p key={paragraph} className="mb-3 leading-relaxed text-muted-foreground">
									{paragraph}
								</p>
							))}
						</section>
					))}
				</div>
			</main>
		</div>
	);
}
