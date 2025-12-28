"use client";

import { motion } from "framer-motion";
import { Triangle } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { workExperience } from "@/lib/data";

const sectionVariants = {
	hidden: { opacity: 0, y: 50 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

const experienceContainerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const experienceItemVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export function ExperienceSection() {
	return (
		<motion.section
			id="experience"
			variants={sectionVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.2 }}
		>
			<h3 className="text-4xl font-bold mb-12 text-center">Work Experience</h3>
			<motion.div
				className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-linear-to-b before:from-gray-800 before:to-transparent"
				variants={experienceContainerVariants}
			>
				{workExperience.map((job, index) => (
					<motion.div
						key={`${job.company}-${job.period}`}
						className="pl-10"
						variants={experienceItemVariants}
					>
						{index === 0 && (
							<div className="absolute -left-8.5 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
								<Triangle className="h-4 w-4 text-white fill-current" />
							</div>
						)}
						<Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-colors duration-300">
							<CardHeader>
								<a
									href={job.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex justify-between items-start flex-col sm:flex-row"
								>
									<div className="flex flex-col gap-2">
										<CardTitle className="text-xl">{job.role}</CardTitle>
										<CardDescription>{job.company}</CardDescription>
									</div>
									<p className="text-sm text-gray-400 mt-2 sm:mt-0">
										{job.period}
									</p>
								</a>
							</CardHeader>
						</Card>
					</motion.div>
				))}
			</motion.div>
		</motion.section>
	);
}
