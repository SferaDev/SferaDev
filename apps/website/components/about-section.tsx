import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { personalInfo } from "@/lib/data";

export function AboutSection() {
	return (
		<section id="about">
			<Reveal>
				<SectionHeading eyebrow="Who I am" title="About Me" />
			</Reveal>
			<Reveal delay={0.1}>
				<div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
					<div className="prose prose-lg max-w-none">
						{personalInfo.bio.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</div>
				</div>
			</Reveal>
		</section>
	);
}
