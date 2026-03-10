"use client";

import { AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

const variants = {
	info: {
		icon: Info,
		border: "border-blue-500 dark:border-blue-400",
		bg: "bg-blue-50/60 dark:bg-blue-950/20",
		iconColor: "text-blue-500 dark:text-blue-400",
	},
	warning: {
		icon: AlertTriangle,
		border: "border-amber-500 dark:border-amber-400",
		bg: "bg-amber-50/60 dark:bg-amber-950/20",
		iconColor: "text-amber-500 dark:text-amber-400",
	},
	success: {
		icon: CheckCircle,
		border: "border-green-500 dark:border-green-400",
		bg: "bg-green-50/60 dark:bg-green-950/20",
		iconColor: "text-green-500 dark:text-green-400",
	},
	tip: {
		icon: Lightbulb,
		border: "border-purple-500 dark:border-purple-400",
		bg: "bg-purple-50/60 dark:bg-purple-950/20",
		iconColor: "text-purple-500 dark:text-purple-400",
	},
} as const;

interface CalloutProps {
	variant?: keyof typeof variants;
	title?: string;
	children: ReactNode;
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
	const { icon: Icon, border, bg, iconColor } = variants[variant];

	return (
		<div className={`my-8 flex gap-3 rounded-xl border-l-4 ${border} ${bg} p-5`}>
			<Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
			<div className="min-w-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:m-0">
				{title && <p className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</p>}
				{children}
			</div>
		</div>
	);
}
