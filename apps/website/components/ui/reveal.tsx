"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
	children: ReactNode;
	/** Seconds to wait before this element animates in. */
	delay?: number;
	className?: string;
}

/**
 * Scroll-triggered entrance animation.
 *
 * The `data-reveal` attribute is the escape hatch: `globals.css` forces these
 * elements visible when scripting is unavailable or the visitor asked for
 * reduced motion, so the content is never hidden behind an animation.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
	return (
		<motion.div
			data-reveal=""
			className={className}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.5, delay, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}
