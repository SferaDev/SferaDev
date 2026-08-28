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
Compare against `main` rather than reading the raw number — see section 2b, which covers the whole
repo at once and is the better version of this check.

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

## 2b. `pnpm tsc` — the gate that exists but never runs

`turbo run tsc` is a real task in `turbo.json`, and **CI does not run it**: `pnpm check` is
`biome + knip + is-tree-shakable` only. So type regressions from a bump are invisible to the board.
Run it — but only ever as a **diff against `main`**, because it is already failing.

Two traps, both hit on 2026-08-28:

1. **Use `--continue`.** Turbo stops the whole run at the first failing package, so without it the
   PR and the control stop at *different* packages and the two error lists are not comparable.
2. **Build first.** `tsc` does not depend on `build`, so on a fresh worktree the API clients fail
   with `Cannot find module '@sferadev/openapi-utils/effect'` — an artefact of the clean tree, not
   a regression.

```bash
# control (see "Before blaming a bump" below for the worktree setup)
cd ../SferaDev-control && pnpm install --frozen-lockfile && pnpm turbo run build >/dev/null
TURBO_FORCE=true pnpm turbo run tsc --continue 2>&1 | grep "error TS" | sed 's/^[^:]*:tsc: //' | sort -u > /tmp/main-tsc.txt

# PR branch, same two commands
TURBO_FORCE=true pnpm turbo run tsc --continue 2>&1 | grep "error TS" | sed 's/^[^:]*:tsc: //' | sort -u > /tmp/pr-tsc.txt
diff /tmp/main-tsc.txt /tmp/pr-tsc.txt
```

**Baseline as of 2026-08-28: 67 errors on `main`**, all in `apps/vscode-ai-gateway` (missing
`@types/node`, plus two `LanguageModelChatCapabilities` properties that exist in no `@types/vscode`
version) and in generated API-client sources. An identical list on both sides is the pass
condition; treat the count as a fingerprint to re-measure, not a number to trust.

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

---

## Before blaming a bump: build a control

The expensive mistake in this phase is debugging a pre-existing failure as if the PR caused it.
Whenever a preview, a test or a CLI/extension build misbehaves, reproduce it on the **pre-PR tree**
before writing it up:

```bash
git worktree add ../SferaDev-control origin/main
cd ../SferaDev-control && pnpm install --frozen-lockfile
# run the exact same command that failed
git worktree remove ../SferaDev-control
```

If the control reproduces it, say "pre-existing on `main`" in the PR description and move on.
Known cases already in this class, so check these before investigating:

- `ai-gateway-proxy` tests failing locally with `GatewayAuthenticationError` → a stale
  `packages/ai-gateway-proxy/.env`, not a bump. See `failure-modes.md` → Tests.
- A turbo `test` run reporting a failure for a package whose test files all show `✓` → the task
  was torn down when a *sibling* package failed. Re-run that package alone before believing it.
- `next-auth` advisories in `pnpm audit` → `apps/openapi` pins the catalog version, and the
  `next-auth` overrides only reach transitive copies. Compare against `main` before treating it
  as new.

**Confirm a route exists before calling its 404 a regression** — enumerate it from the app rather
than guessing the path, then run the same path against production.

---

## What to write in the PR description

Cover, briefly:

- holds re-vetted, and whether any were released (with the evidence)
- what broke, the fix, and whether it is a class the skill should learn
- what you verified from the list above — and explicitly what you did **not**

Being explicit about the gap matters more than the list of greens: the next reviewer needs to know
whether the previews were exercised or merely deployed.
