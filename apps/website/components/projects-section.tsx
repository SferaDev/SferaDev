import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	type CuratedProject,
	featuredPackageNames,
	openSourceIntro,
	platformHighlights,
	upstreamContributions,
} from "@/lib/data";
import { getPublishedPackages, type PublishedPackage } from "@/lib/packages";

interface ProjectLink {
	label: string;
	url: string;
}

/** Docs links are same-origin rewrites, everything else opens in a new tab. */
function externalLinkProps(url: string) {
	return url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function ProjectCard({
	name,
	url,
	version,
	description,
	links,
}: {
	name: string;
	url: string;
	version?: string;
	description: string;
	links: ProjectLink[];
}) {
	return (
		<Card className="bg-card/50 border-border flex flex-col h-full transition-colors duration-300 hover:border-brand/50 focus-within:border-brand/50">
			<CardHeader>
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="font-semibold leading-none">
						<a
							href={url}
							{...externalLinkProps(url)}
							className="inline-flex items-center gap-1 hover:text-brand focus-visible:text-brand transition-colors"
						>
							{name}
							<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
						</a>
					</h3>
					{version ? (
						<span className="font-mono text-xs text-muted-foreground shrink-0">v{version}</span>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="grow">
				<p className="text-muted-foreground text-sm">{description}</p>
			</CardContent>
			<CardContent className="flex flex-wrap gap-x-4 gap-y-1">
				{links.map((link) => (
					<a
						key={link.url}
						href={link.url}
						{...externalLinkProps(link.url)}
						aria-label={`${name} on ${link.label}`}
						className="font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-brand focus-visible:text-brand transition-colors"
					>
						{link.label}
					</a>
				))}
			</CardContent>
		</Card>
	);
}

function PackageCard({ pkg }: { pkg: PublishedPackage }) {
	const links: ProjectLink[] = [
		...(pkg.docsUrl ? [{ label: "Docs", url: pkg.docsUrl }] : []),
		{ label: "npm", url: pkg.npmUrl },
		{ label: "Source", url: pkg.sourceUrl },
	];

	return (
		<ProjectCard
			name={pkg.name}
			url={pkg.docsUrl ?? pkg.npmUrl}
			version={pkg.version}
			description={pkg.description}
			links={links}
		/>
	);
}

function CuratedCard({ project }: { project: CuratedProject }) {
	return (
		<ProjectCard
			name={project.name}
			url={project.url}
			description={project.description}
			links={project.links}
		/>
	);
}

function ProjectGroup({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
				{label}
			</p>
			<div className="grid gap-6 md:grid-cols-2">{children}</div>
		</div>
	);
}

export function ProjectsSection() {
	const publishedPackages = getPublishedPackages();

	const featuredPackages = featuredPackageNames.flatMap((name) => {
		const match = publishedPackages.find((pkg) => pkg.name === name);
		return match ? [match] : [];
	});
	const remainingPackages = publishedPackages.filter(
		(pkg) => !featuredPackageNames.includes(pkg.name),
	);

	return (
		<section id="projects" className="scroll-mt-24">
			<h2 className="text-4xl font-bold mb-4 text-center">Open Source</h2>
			<p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground mb-12">
				{openSourceIntro}
			</p>

			<div className="space-y-12">
				<ProjectGroup label="Platform & AI tooling">
					{featuredPackages.map((pkg) => (
						<PackageCard key={pkg.name} pkg={pkg} />
					))}
					{platformHighlights.map((project) => (
						<CuratedCard key={project.name} project={project} />
					))}
				</ProjectGroup>

				<ProjectGroup label="Upstream contributions">
					{upstreamContributions.map((project) => (
						<CuratedCard key={project.name} project={project} />
					))}
				</ProjectGroup>

				<ProjectGroup label="Also published on npm">
					{remainingPackages.map((pkg) => (
						<PackageCard key={pkg.name} pkg={pkg} />
					))}
				</ProjectGroup>
			</div>
		</section>
	);
}
