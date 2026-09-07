import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { workExperience } from "@/lib/data";

export function ExperienceSection() {
	return (
		<section id="experience">
			<Reveal>
				<SectionHeading eyebrow="Career" title="Work Experience" />
			</Reveal>
			<ol className="relative ml-2 space-y-4 pl-8 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-linear-to-b before:from-border before:via-border before:to-transparent sm:pl-10">
				{workExperience.map((job, index) => (
					<li key={`${job.company}-${job.period}`} className="relative">
						<span
							aria-hidden="true"
							className="-left-8 -translate-x-1/2 absolute top-7 size-2.5 rounded-full bg-brand ring-4 ring-background sm:-left-10"
						/>
						<Reveal delay={index * 0.06}>
							<Card className="gap-0 border-border bg-card/60 py-5 transition-colors duration-300 hover:border-brand/50">
								<CardHeader>
									<a
										href={job.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"
									>
										<div className="flex flex-col gap-1.5">
											<CardTitle className="text-lg">{job.role}</CardTitle>
											<CardDescription className="text-base">{job.company}</CardDescription>
										</div>
										<p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
											{job.period}
										</p>
									</a>
								</CardHeader>
							</Card>
						</Reveal>
					</li>
				))}
			</ol>
		</section>
	);
}
