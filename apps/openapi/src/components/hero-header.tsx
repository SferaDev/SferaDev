"use client";

import { CodeXml } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="GitHub"
			{...props}
		>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

export function HeroHeader() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			{/* Hero Section */}
			<section className="relative bg-linear-to-b from-background to-background/50 border-b">
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="text-center pt-16 pb-8">
						<h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
							Unofficial Type-Safe OpenAPI Clients
						</h1>
						<p className="text-muted-foreground text-lg md:text-xl max-w-4xl mx-auto">
							A collection of automatically generated and updated API clients for popular services
						</p>
					</div>
				</div>
			</section>

			{/* Sticky Header (only visible when scrolled) */}
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isScrolled
						? "translate-y-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b shadow-sm"
						: "-translate-y-full"
				}`}
			>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-3">
							<CodeXml className="h-5 w-5" />
							<span className="font-bold text-lg tracking-tight">OpenAPI Clients</span>
						</div>
						<div className="flex items-center space-x-4">
							<Button variant="outline" size="sm" asChild>
								<Link
									href="https://github.com/SferaDev/openapi-clients"
									target="_blank"
									rel="noopener noreferrer"
								>
									<GithubIcon className="mr-2 h-4 w-4" />
									GitHub
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
