# SferaDev Website

Personal website built with Next.js, Tailwind CSS and Motion.

## Scripts

```bash
pnpm dev    # Start development server
pnpm build  # Build for production
pnpm start  # Start production server
pnpm tsc    # Type check
```

Linting, dead-code analysis and tests run from the repository root — `pnpm check`
and `pnpm test` — because they cover the whole workspace.

## Content

- `content/blog/*.mdx` — blog posts. Frontmatter is validated by a zod schema in
  `lib/blog.ts`; a post declares either `originalUrl` (this text was first
  published elsewhere, so that URL is its canonical) or `externalUrl` (it links
  out to related material and is canonical to itself), never both.
- `lib/data.ts` — bio, work history, sferarc and the curated project highlights.
- The published package grid is not hand-maintained: `lib/packages.ts` reads
  `packages/*` from the workspace at build time, so new packages appear on their
  own and versions never go stale.
