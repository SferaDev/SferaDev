"use client";

import { motion } from "framer-motion";
import { BentoCard, BentoGrid } from "@/components/bento-grid";
import { personalInfo } from "@/lib/data";

const sectionVariants = {
	hidden: { opacity: 0, y: 50 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export function AboutSection() {
	return (
		<motion.section
			id="about"
			variants={sectionVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.2 }}
		>
			<h3 className="text-4xl font-bold mb-12 text-center">About Me</h3>
			<BentoGrid className="auto-rows-min">
				<BentoCard
					className="col-span-12"
					name="Bio"
					background={<div className="absolute inset-0 bg-gray-900/80" />}
				>
					{personalInfo.bio.map((paragraph, index) => (
						<p key={index} className="text-lg text-gray-300 mb-4 text-justify last:mb-0">
							{paragraph}
						</p>
					))}
				</BentoCard>
			</BentoGrid>
		</motion.section>
	);
}
