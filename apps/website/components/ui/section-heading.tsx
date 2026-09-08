import { cn } from "@/lib/utils";

interface SectionHeadingProps {
	/** Short mono label rendered above the title. */
	eyebrow: string;
	/**
	 * Eyebrows are upper-cased for rhythm, but a brand name has to keep the casing
	 * it is actually written in, so `preserve` opts out.
	 */
	eyebrowCase?: "upper" | "preserve";
	title: string;
	description?: string;
	className?: string;
}

export function SectionHeading({
	eyebrow,
	eyebrowCase = "upper",
	title,
	description,
	className,
}: SectionHeadingProps) {
	return (
		<div className={cn("mb-10 flex flex-col items-center gap-3 text-center", className)}>
			<span
				className={cn(
					"font-mono text-xs tracking-[0.2em] text-brand",
					eyebrowCase === "upper" && "uppercase",
				)}
			>
				{eyebrow}
			</span>
			<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
			{description ? (
				<p className="max-w-2xl text-pretty text-muted-foreground">{description}</p>
			) : null}
		</div>
	);
}
