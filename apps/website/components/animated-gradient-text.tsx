import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedGradientText({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/5 px-4 py-2 my-0",
				className,
			)}
		>
			<div
				className={
					"animate-gradient absolute inset-0.5 -z-10 rounded-xl bg-linear-to-r from-[#4f46e5] via-[#0ea5e9] to-[#4f46e5] bg-size-[200%_100%] opacity-75 blur-xl transition-opacity duration-500 group-hover:opacity-100"
				}
			/>
			{children}
		</div>
	);
}
