"use client";

import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import Image from "next/image";
import { AnimatedGradientText } from "@/components/animated-gradient-text";
import { AuroraBackground } from "@/components/aurora-background";
import { Button } from "@/components/ui/button";
import { personalInfo } from "@/lib/data";

export function HeroSection() {
	return (
		<section
			id="hero"
			className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] -mt-8 select-none"
		>
			<AuroraBackground />
			<div className="relative z-10 flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<motion.div
						className="relative mx-auto mb-6 border-4 border-border shadow-lg w-64 h-64 rounded-full overflow-hidden"
						whileHover={{ scale: 1.05 }}
					>
						<Image
							src="/profile.png"
							alt={personalInfo.name}
							fill
							className="object-cover"
							priority
							sizes="256px"
							fetchPriority="high"
						/>
					</motion.div>
					<AnimatedGradientText className="text-center mt-12 mb-6">
						<h1 className="text-5xl md:text-7xl p-2 font-bold font-sans tracking-normal">
							{personalInfo.name}
						</h1>
					</AnimatedGradientText>
				</motion.div>
				<motion.p
					className="max-w-2xl mx-auto text-lg text-muted-foreground my-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{personalInfo.description}
				</motion.p>
				<motion.div
					className="flex justify-center gap-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
				>
					<Button
						asChild
						size="lg"
						className="bg-foreground text-background hover:bg-foreground/90"
					>
						<a href={`mailto:${personalInfo.email}`}>
							<Mail className="mr-2 h-4 w-4" /> Email
						</a>
					</Button>
					<Button variant="secondary" size="lg" asChild>
						<a
							href={personalInfo.github}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Visit ${personalInfo.name}'s GitHub profile`}
						>
							<Github className="mr-2 h-4 w-4" /> GitHub
						</a>
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
