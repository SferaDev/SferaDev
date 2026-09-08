import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { sferarc } from "@/lib/data";

export function SferarcSection() {
	return (
		<section id="sferarc" className="scroll-mt-24">
			<h2 className="text-4xl font-bold mb-4 text-center">{sferarc.name}</h2>
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-center mb-6">
				{sferarc.tagline}
			</p>
			<p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground mb-12">
				{sferarc.intro}
			</p>

			<div className="grid gap-6">
				{sferarc.products.map((product) => (
					<Card
						key={product.name}
						className="bg-card/50 border-border transition-colors duration-300 hover:border-brand/50 focus-within:border-brand/50"
					>
						<CardHeader>
							<h3 className="text-2xl font-semibold leading-none">
								<a
									href={product.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 hover:text-brand focus-visible:text-brand transition-colors"
								>
									{product.name}
									<ArrowUpRight className="h-5 w-5" aria-hidden="true" />
								</a>
							</h3>
							<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
								{product.tagline}
							</p>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground max-w-2xl">{product.description}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}
