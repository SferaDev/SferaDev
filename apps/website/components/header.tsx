"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full transition-all duration-300",
				scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent",
			)}
		>
			<div className="container h-16 flex items-center justify-between px-6 md:px-8 max-w-none">
				<Link
					href="/"
					className="font-mono font-bold text-muted-foreground hover:text-foreground transition-colors"
				>
					SferaDev
				</Link>
				<div className="flex items-center gap-6">
					<nav className="hidden sm:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
						<Link href="/#about" className="hover:text-foreground transition-colors">
							About
						</Link>
						<Link href="/#experience" className="hover:text-foreground transition-colors">
							Experience
						</Link>
						<Link href="/#projects" className="hover:text-foreground transition-colors">
							Projects
						</Link>
						<Link href="/blog" className="hover:text-foreground transition-colors">
							Blog
						</Link>
						<Link href="/docs" className="hover:text-foreground transition-colors">
							Docs
						</Link>
					</nav>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
