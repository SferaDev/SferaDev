"use client";

import { motion } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AuroraBackground = ({ className, ...props }: AuroraBackgroundProps) => {
	return (
		<div
			className={cn("fixed -z-10 inset-0 overflow-hidden transition-bg", className)}
			{...props}
		>
			<div
				className={cn(
					`
        [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
        [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
        [--aurora-light:repeating-linear-gradient(100deg,var(--blue-200)_10%,var(--indigo-100)_15%,var(--blue-100)_20%,var(--violet-100)_25%,var(--blue-200)_30%)]
        dark:[background-image:var(--dark-gradient),var(--aurora)]
        [background-image:var(--aurora-light)]
        bg-size-[300%,200%]
        bg-position-[50%_50%,50%_50%]
        filter-none
        after:content-[""] after:absolute after:inset-0
        dark:after:[background-image:var(--dark-gradient),var(--aurora)]
        after:[background-image:var(--aurora-light)]
        after:bg-size-[200%,100%]
        after:animate-aurora after:bg-fixed dark:after:mix-blend-difference
        pointer-events-none
        absolute -inset-[10px] opacity-60 dark:opacity-50 will-change-transform`,
				)}
			>
				<motion.div
					initial={{ x: "-50%", y: "-50%" }}
					animate={{
						x: ["-50%", "50%"],
						y: ["-50%", "50%"],
					}}
					transition={{
						duration: 20,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "mirror",
						ease: "easeInOut",
					}}
					className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.3)_0%,rgba(255,255,255,0)_70%)]"
				/>
			</div>
		</div>
	);
};
