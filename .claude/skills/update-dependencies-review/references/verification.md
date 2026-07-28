# Verification

CI gates on `pnpm check` and `pnpm test` only. Everything below is what CI cannot see, ordered by
how often it has actually caught something.

---

## 1. The VS Code extension (highest yield)

CI never runs `vsce package`, so extension packaging breaks land on `main` and only fail during
the Release run.

```bash
pnpm --filter vscode-extension-vercel-ai test
pnpm --filter vscode-extension-vercel-ai package   # the check CI does not do
rm -f apps/vscode-ai-gateway/*.vsix
```

Run this whenever the diff touches `@types/vscode`, `@vscode/vsce`, `bunchee`, or the extension's
own dependencies. See the two `vsce` entries in `failure-modes.md` for what the failures mean —
the `@types/vscode` ↔ `engines.vscode` coupling is the recurring one.

`tsc` currently reports pre-existing errors in this app (`@types/node` missing from its tsconfig).
Compare counts before and after rather than reading the raw number:

```bash
pnpm --filter vscode-extension-vercel-ai exec tsc --noEmit 2>&1 | grep -c "error TS"
```

---

## 2. Packages build from committed sources

```bash
pnpm turbo run build --filter="./packages/*" --force
git status --short          # must be clean
```

Two assertions in one: the build works, **and** it produced no git churn. Churn means something
re-ran codegen during the build (see `failure-modes.md` → Build), which is both a network
dependency and a source of spurious diffs.

---

## 3. Runtime surfaces

The apps deploy Vercel previews on the PR (`openapi-clients`, `photocall`, `platform`, `seating`,
`website`). Exercise them when the bump touches something they run on — a green deploy only
proves it compiled.

| Bumped | Exercise |
| --- | --- |
| `next`, `react`, `react-dom` | load each preview; check the browser console for hydration errors |
| `better-auth`, `next-auth`, `@auth/*` | sign-in flow on `platform` |
| `drizzle-orm`, `drizzle-kit`, `pg` | any page that reads data; watch for runtime query errors |
| `ai`, `@ai-sdk/*` | a real chat/generation request, not just page load |
| `tailwindcss`, `@tailwindcss/postcss` | visual check — Tailwind v4 theme tokens fail silently, rendering transparent rather than erroring |
| `konva`, `react-konva`, `html-to-image` | the photocall template editor / capture path |
| `stripe` | checkout path on `platform` |

Native or postinstall-heavy packages (`sharp`, `prisma`, `@swc/core`, `puppeteer`) deserve extra
suspicion: their build scripts are **not** run here (`onlyBuiltDependencies` allows only
`lefthook`), so a bump that starts depending on a postinstall step fails at runtime, not install.

---

## 4. After merge — the Release run

Merging a dependency PR triggers `release.yml`. It publishes npm packages via **OIDC trusted
publishing** and the VS Code extension via `vsce`.

```bash
gh run list --workflow=release.yml --limit 3
```

- npm 404s on every package → someone re-added `registry-url` to `setup-node`; see
  `failure-modes.md`.
- `ENEEDAUTH` on one package → it does not exist on npm yet and has no trusted publisher.
- Extension "Published" but not live → asynchronous Marketplace validation; verify with the
  gallery API query in `failure-modes.md` rather than trusting the log line.

Confirm what actually landed:

```bash
npm view <pkg> version _npmUser     # expect: GitHub Actions <npm-oidc-no-reply@github.com>
```

An `_npmUser` that is a person means the OIDC path silently fell back to a manual publish path —
worth investigating.

---

## What to write in the PR comment

Cover, briefly:

- holds re-vetted, and whether any were released (with the evidence)
- what broke, the fix, and whether it is a class the skill should learn
- what you verified from the list above — and explicitly what you did **not**

Being explicit about the gap matters more than the list of greens: the next reviewer needs to know
whether the previews were exercised or merely deployed.
