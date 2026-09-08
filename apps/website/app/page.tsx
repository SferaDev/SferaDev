import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { SferarcSection } from "@/components/sferarc-section";
import { JsonLd, personGraph } from "./json-ld";

export default function PortfolioPage() {
	return (
		<>
			<JsonLd schema={personGraph()} />
			<main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
				<HeroSection />

				<div className="space-y-24 py-16 md:space-y-32">
					<AboutSection />
					<ExperienceSection />
					<SferarcSection />
					<ProjectsSection />
				</div>
			</main>
			<Footer />
		</>
	);
}
