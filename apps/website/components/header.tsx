"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Header() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 8);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-colors duration-300 supports-[backdrop-filter]:bg-background/65",
				scrolled ? "border-border" : "border-transparent",
			)}
		>
			<div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
				<Link
					href="/"
					className="font-bold font-mono text-foreground tracking-tight transition-colors hover:text-brand"
				>
					SferaDev
				</Link>
				<div className="flex items-center gap-4 sm:gap-6">
					<nav
						aria-label="Main"
						className="hidden items-center gap-6 font-medium text-muted-foreground text-sm sm:flex"
					>
						{navigation.map(({ href, label, prefetch }) => (
							<Link
								key={href}
								href={href}
								prefetch={prefetch}
								className="transition-colors hover:text-foreground"
							>
								{label}
							</Link>
						))}
					</nav>
					<ThemeToggle />
					<MobileNav items={navigation} />
				</div>
			</div>
		</header>
	);
}
