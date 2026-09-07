import { cn } from "@/lib/utils";

interface SectionHeadingProps {
	/** Short mono label rendered above the title. */
	eyebrow: string;
	title: string;
	description?: string;
	className?: string;
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
	return (
		<div className={cn("mb-10 flex flex-col items-center gap-3 text-center", className)}>
			<span className="font-mono text-xs uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
			<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
			{description ? (
				<p className="max-w-2xl text-pretty text-muted-foreground">{description}</p>
			) : null}
		</div>
	);
}
