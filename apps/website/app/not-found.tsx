import Link from "next/link";
import { AnimatedGradientText } from "@/components/animated-gradient-text";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<>
			<main className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 py-32 text-center sm:px-6">
				<p className="font-mono text-brand text-xs uppercase tracking-[0.2em]">Error 404</p>
				<h1 className="font-bold text-6xl tracking-tight sm:text-7xl">
					<AnimatedGradientText>Page not found</AnimatedGradientText>
				</h1>
				<p className="max-w-md text-pretty text-muted-foreground">
					The page you're looking for doesn't exist or has moved somewhere else.
				</p>
				<Button asChild size="lg">
					<Link href="/">Go home</Link>
				</Button>
			</main>

			<Footer />
		</>
	);
}
