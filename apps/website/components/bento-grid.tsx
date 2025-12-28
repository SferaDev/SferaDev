"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => {
	return (
		<motion.div
			initial="initial"
			animate="animate"
			transition={{
				staggerChildren: 0.1,
			}}
			className={cn("grid grid-cols-12 auto-rows-[22rem] gap-4", className)}
		>
			{children}
		</motion.div>
	);
};

const variants = {
	initial: {
		opacity: 0,
		y: 20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
} as const;

export const BentoCard = ({
	name,
	className,
	background,
	children,
}: {
	name: string;
	className: string;
	background: ReactNode;
	children: ReactNode;
}) => {
	return (
		<motion.div
			variants={variants}
			className={cn(
				"group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
				"transform-gpu bg-card border border-border [box-shadow:0_-20px_80px_-20px_hsl(var(--muted))_inset]",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 z-10 transition-all duration-300 group-hover:bg-background/30" />
			{background}
			<div className="pointer-events-none relative z-20 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300">
				<h3 className="text-xl font-semibold text-foreground">{name}</h3>
			</div>
			<div className="relative z-20 p-6 pt-0">{children}</div>
		</motion.div>
	);
};
