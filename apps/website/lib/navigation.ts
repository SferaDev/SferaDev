export interface NavigationItem {
	href: string;
	label: string;
	/** `/docs` is a Vercel rewrite to Mintlify, so there is no RSC payload to prefetch. */
	prefetch?: boolean;
}

export const navigation: readonly NavigationItem[] = [
	{ href: "/#about", label: "About" },
	{ href: "/#experience", label: "Experience" },
	{ href: "/#projects", label: "Projects" },
	{ href: "/blog", label: "Blog" },
	{ href: "/docs", label: "Docs", prefetch: false },
];
