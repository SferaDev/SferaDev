import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";

export default function PortfolioPage() {
	return (
		<>
			<main className="container mx-auto px-4 max-w-5xl">
				<HeroSection />

				<div className="space-y-24 md:space-y-32 py-16">
					<AboutSection />
					<ExperienceSection />
					<ProjectsSection />
				</div>
			</main>
			<Footer />
		</>
	);
}
