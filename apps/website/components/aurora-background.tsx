import type React from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative backdrop for the hero: a slow drifting colour field over a faint
 * grid, both driven by the theme tokens so it adapts to light and dark. A
 * radial mask dissolves the whole thing into the page background at the edges.
 */
export function AuroraBackground({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_62%_55%_at_50%_40%,black_15%,transparent_85%)]",
				className,
			)}
			{...props}
		>
			<div className="absolute inset-[-20%] animate-aurora bg-size-[55%_55%] bg-no-repeat blur-3xl [background-image:radial-gradient(closest-side,var(--aurora-1),transparent),radial-gradient(closest-side,var(--aurora-2),transparent),radial-gradient(closest-side,var(--aurora-3),transparent)]" />
			<div className="absolute inset-0 bg-size-[52px_52px] [background-image:linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)]" />
		</div>
	);
}
