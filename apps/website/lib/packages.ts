import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * The website lists every package this monorepo publishes. Rather than keeping a
 * hand-written copy in sync, the list is read from the workspace at build time so new
 * packages show up on their own and versions are never stale.
 */
export interface PublishedPackage {
	/** npm package name, e.g. `vercel-api-js`. */
	name: string;
	version: string;
	/** Empty when neither the manifest nor the docs page describes the package. */
	description: string;
	npmUrl: string;
	sourceUrl: string;
	/** `null` when the package has no page under `content/docs/packages`. */
	docsUrl: string | null;
}

const manifestSchema = z.object({
	name: z.string(),
	version: z.string(),
	description: z.string().optional(),
	private: z.boolean().optional(),
});

const docsFrontmatterSchema = z.object({
	description: z.string().optional(),
});

const workspaceRootMarker = "pnpm-workspace.yaml";
const repositoryUrl = "https://github.com/SferaDev/SferaDev";
/** Rewritten to the Mintlify docs site by `vercel.ts`, so a relative path works on previews too. */
const docsBaseUrl = "/docs/packages";

/**
 * Walks up from the current working directory until the pnpm workspace manifest shows
 * up, so this works both from `apps/website` locally and from wherever Vercel runs the
 * build inside the checked-out monorepo.
 */
function findWorkspaceRoot(): string {
	let directory = process.cwd();

	while (!fs.existsSync(path.join(directory, workspaceRootMarker))) {
		const parent = path.dirname(directory);
		if (parent === directory) {
			throw new Error(`Could not find ${workspaceRootMarker} above ${process.cwd()}`);
		}
		directory = parent;
	}

	return directory;
}

function readManifest(manifestPath: string) {
	return manifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
}

interface DocsPage {
	url: string;
	description: string | undefined;
}

function readDocsPage(workspaceRoot: string, packageName: string): DocsPage | null {
	const docsPath = path.join(workspaceRoot, "content/docs/packages", `${packageName}.mdx`);
	if (!fs.existsSync(docsPath)) return null;

	const { data } = matter(fs.readFileSync(docsPath, "utf8"));
	const frontmatter = docsFrontmatterSchema.parse(data);

	return { url: `${docsBaseUrl}/${packageName}`, description: frontmatter.description };
}

export function getPublishedPackages(): PublishedPackage[] {
	const workspaceRoot = findWorkspaceRoot();
	const packagesDirectory = path.join(workspaceRoot, "packages");

	const packages = fs
		.readdirSync(packagesDirectory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap((entry) => {
			const manifestPath = path.join(packagesDirectory, entry.name, "package.json");
			if (!fs.existsSync(manifestPath)) return [];

			const manifest = readManifest(manifestPath);
			if (manifest.private) return [];

			const docs = readDocsPage(workspaceRoot, manifest.name);

			return [
				{
					name: manifest.name,
					version: manifest.version,
					description: docs?.description ?? manifest.description ?? "",
					npmUrl: `https://www.npmjs.com/package/${manifest.name}`,
					sourceUrl: `${repositoryUrl}/tree/main/packages/${entry.name}`,
					docsUrl: docs?.url ?? null,
				} satisfies PublishedPackage,
			];
		});

	return packages.sort((a, b) => a.name.localeCompare(b.name));
}
