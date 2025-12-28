"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { openSourceProjects } from "@/lib/data";

const sectionVariants = {
	hidden: { opacity: 0, y: 50 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export function ProjectsSection() {
	return (
		<motion.section
			id="projects"
			variants={sectionVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.2 }}
		>
			<h3 className="text-4xl font-bold mb-12 text-center">Open Source</h3>
			<div className="grid md:grid-cols-2 gap-6">
				{openSourceProjects.map((project, index) => (
					<motion.div
						key={project.name}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
					>
						<Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-colors duration-300 flex flex-col h-full group">
							<CardHeader>
								<CardTitle>{project.name}</CardTitle>
							</CardHeader>
							<CardContent className="grow">
								<p className="text-gray-300">{project.description}</p>
							</CardContent>
							<CardContent>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-semibold text-blue-400 flex items-center gap-1"
									aria-label={`View ${project.name} project`}
								>
									View Project{" "}
									<ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
								</a>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.section>
	);
}
