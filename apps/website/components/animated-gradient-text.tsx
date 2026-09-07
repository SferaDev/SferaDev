import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders its children as text filled with a slowly sweeping brand gradient.
 * The `gradient-text` utility lives in `globals.css` so the gradient stays tied
 * to the theme tokens.
 */
export function AnimatedGradientText({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <span className={cn("gradient-text", className)}>{children}</span>;
}
