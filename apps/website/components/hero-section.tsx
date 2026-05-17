"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import { AnimatedGradientText } from "@/components/animated-gradient-text";
import { AuroraBackground } from "@/components/aurora-background";
import { Button } from "@/components/ui/button";
import { personalInfo } from "@/lib/data";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="GitHub"
			{...props}
		>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

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
							<GithubIcon className="mr-2 h-4 w-4" /> GitHub
						</a>
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
