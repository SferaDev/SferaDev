export const workExperience = [
	{
		company: "Xata",
		role: "Principal Software Engineer",
		period: "Mar 2026 – Present",
		url: "https://xata.io",
	},
	{
		company: "Xata",
		role: "Staff Software Engineer - Tech Lead",
		period: "Jan 2023 – Mar 2026",
		url: "https://xata.io",
	},
	{
		company: "Xata",
		role: "Senior Software Engineer",
		period: "Feb 2022 – Jan 2023",
		url: "https://xata.io",
	},
	{
		company: "EyeSeeTea",
		role: "Senior Software Engineer",
		period: "Feb 2019 – Feb 2022",
		url: "https://eyeseetea.com",
	},
	{
		company: "DTIM - Polytechnic University of Barcelona",
		role: "Software Engineer",
		period: "Feb 2018 – Jun 2019",
		url: "https://dtim.upc.edu/en",
	},
	{
		company: "Paranoid Android",
		role: "AOSP Developer",
		period: "Nov 2013 – Oct 2017",
		url: "https://paranoidandroid.co/team",
	},
];

export const sferarc = {
	/** Section heading. The brand itself is the eyebrow, so the lowercase name never has to open a sentence. */
	heading: "Products",
	name: "sferarc",
	intro:
		"My developer tooling company, separate from my work at Xata. It is where infrastructure I build ships as a product rather than as a library, starting with PgBeam.",
	products: [
		{
			name: "PgBeam",
			tagline: "Safe Postgres access for AI agents",
			description:
				"Hand an AI agent a scoped Postgres connection instead of a superuser one. Read-only access, table allowlists, PII masking, budgets, a kill-switch and a full audit trail, all enforced in the wire protocol. Any Postgres, no code changes.",
			url: "https://pgbeam.com",
		},
	],
};

/**
 * Packages shown ahead of the rest of the grid: the platform and AI integration work.
 * Names must match the npm package names read from the workspace by `lib/packages.ts`.
 */
export const featuredPackageNames = ["vercel-api-js", "v0-api", "ai-gateway-proxy"];

export const openSourceIntro =
	"Most of my open source work is platform integration: type-safe clients generated from upstream OpenAPI specs and regenerated as those specs change, plus the tooling around Vercel's AI Gateway. Everything here is versioned and published on npm, checked for tree-shakability in CI, and documented under /docs.";

export interface CuratedProject {
	name: string;
	/** Where the card title points. */
	url: string;
	description: string;
	links: { label: string; url: string }[];
}

/** Platform work that ships outside npm, so `lib/packages.ts` cannot pick it up. */
export const platformHighlights: CuratedProject[] = [
	{
		name: "Vercel AI Gateway for VS Code",
		url: "https://marketplace.visualstudio.com/items?itemName=SferaDev.vscode-extension-vercel-ai",
		description:
			"A VS Code extension that exposes Vercel AI Gateway models through the editor's native Language Model API, so they appear wherever VS Code offers a model picker.",
		links: [
			{
				label: "Marketplace",
				url: "https://marketplace.visualstudio.com/items?itemName=SferaDev.vscode-extension-vercel-ai",
			},
			{ label: "Docs", url: "/docs/packages/vscode-extension-vercel-ai" },
		],
	},
];

/** Open source I contribute to but do not publish myself. */
export const upstreamContributions: CuratedProject[] = [
	{
		name: "Keycloak",
		url: "https://github.com/keycloak/keycloak/pulls?q=is%3Apr+author%3ASferaDev",
		description:
			"Contributions to the identity and access management server, mostly around organizations and the admin APIs.",
		links: [
			{
				label: "Pull requests",
				url: "https://github.com/keycloak/keycloak/pulls?q=is%3Apr+author%3ASferaDev",
			},
		],
	},
	{
		name: "Xata",
		url: "https://github.com/xataio/xata",
		description:
			"The Postgres platform itself: cloud native, with copy-on-write branching and scale-to-zero.",
		links: [{ label: "GitHub", url: "https://github.com/xataio/xata" }],
	},
	{
		name: "Xata TS SDK",
		url: "https://github.com/xataio/ts-sdk",
		description: "The TypeScript SDK for Xata, and the successor to the deprecated client-ts.",
		links: [{ label: "GitHub", url: "https://github.com/xataio/ts-sdk" }],
	},
	{
		name: "Xata CLI",
		url: "https://github.com/xataio/cli",
		description: "The command line interface for managing Xata projects, branches and migrations.",
		links: [{ label: "GitHub", url: "https://github.com/xataio/cli" }],
	},
];

export const personalInfo = {
	name: "Alexis Rico",
	email: "alexis@sferadev.com",
	github: "https://github.com/SferaDev",
	description:
		"Principal Software Engineer building serverless databases and developer tools. I specialize in TypeScript and Go, creating type-safe APIs and SDKs.",
	bio: [
		"I'm a Principal Software Engineer at Xata, where I work on serverless database infrastructure and developer tooling. My work focuses on building type-safe systems with TypeScript and Go, designing APIs that are intuitive to use, and creating SDKs that provide great developer experiences.",
		"Alongside that I run sferarc, my developer tooling company, whose flagship product is PgBeam: it gives AI agents a scoped Postgres connection instead of a superuser one, enforcing read-only access, table allowlists, PII masking and a full audit trail in the wire protocol.",
	],
};
