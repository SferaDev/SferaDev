# Failure modes

Symptom-keyed catalog of what has actually broken in this repo's weekly dependency job. Grep for
the error string first.

Every version here is **dated evidence of a class of failure**, not a statement about today.
Re-read the repo before acting on any of it.

---

## Install

### `ERR_PNPM_CATALOG_VERSION_MISMATCH` — "Wanted dependency outside the version range defined in catalog"

*Seen 2026-07 during `pnpm update --recursive --latest`.*

`pnpm-workspace.yaml` sets `catalogMode: strict`. The published API clients
(`vercel-api-js`, `netlify-api`, `zoom-api-js`, `nuki-api-js`, `v0-api`, `openapi-utils`,
`rollup-plugin-import-cdn`) deliberately declare **broad peer ranges** — `effect: "^3.0.0"`,
`rollup: "^3.0.0 || ^4.0.0"` — that differ from the exact catalog pin. Strict mode refuses to
reconcile a broad literal range with the exact catalog entry while resolving `latest`, and aborts
the whole update.

The workflow already handles this by relaxing `catalogMode` to `manual` around the bump and
restoring `strict` after. If you hit it manually, do the same — do **not** "fix" it by converting
the peer ranges to `catalog:`, which would publish an exact peer pin to consumers.

Confirmed on pnpm 10.26 → 10.30 → 11.12: intentional behaviour, not a version bug. Named catalogs
do not help — the strict check only ever validates against the default catalog.

### `ERR_PNPM_OUTDATED_LOCKFILE` — "not up to date with `<pkg>/package.json`"

*Seen 2026-07 on `packages/openapi-utils`.*

A `"catalog:"` reference was rewritten to a literal version, and `cleanupUnusedCatalogs: true` then
deleted the orphaned catalog entry — so the package quietly stopped being catalog-managed.

The trigger is a **catalog entry and an override disagreeing about the same package**. Under the
`catalogMode: manual` window the workflow opens for the bump, pnpm resolves that contradiction by
writing the literal into the manifest. Check for it directly:

```bash
git diff origin/main -- '*/package.json' | grep -E '^\-.*"catalog:"'
```

Fix by making the catalog and the override agree, then restoring the `catalog:` reference. Do not
"fix" it by accepting the literal — that silently drops the package out of the catalog.

### `ERR_PNPM_IGNORED_BUILDS` — "Ignored build scripts: …"

*Seen 2026-07 when `mise up --bump` moved pnpm 10 → 11. Migration completed the same week; kept
as the worked example of what a pnpm major costs.*

pnpm 11 changed three things at once:

1. `strictDepBuilds` defaults to `true` — ignoring any dependency build script **fails** the
   install instead of warning.
2. `onlyBuiltDependencies` is replaced by `allowBuilds`, so the existing allow-entry stopped
   applying — which is why `lefthook` appeared in its own ignored list.
3. **The `pnpm` field in package.json is no longer read** — `pnpm.overrides`, where all the
   security overrides lived, was silently ignored:
   ```
   [WARN] The "pnpm" field in package.json is no longer read by pnpm.
          The following keys were ignored: "pnpm.overrides".
   ```

The third is the one to remember: it emitted a warning, not an error, and would have shipped a
lockfile with every security override missing. **When a package manager crosses a major, ask what
it stopped reading, not just what it renamed.**

Now resolved — overrides live in `pnpm-workspace.yaml`, `allowBuilds` carries an explicit decision
per package.

**The recurrence to expect:** any update that pulls in a *new* package with build scripts fails
the same way — first seen with `@scarf/scarf@1.4.0`, a telemetry postinstall arriving as a
transitive dependency. The workflow now absorbs this: on install failure it defaults the new
placeholders to `false` (never run an install script we did not opt into), retries, and emits a
`::warning::`.

So when reviewing, **read the `allowBuilds` additions in the diff**. Each new `false` is a package
that started shipping an install script. Usually correct to leave; flip to `true` only if the
package genuinely needs to build (native module the code actually loads at runtime), and say why
in the review comment.

### `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`

pnpm wants to replace a `node_modules` written by a different pnpm major and cannot prompt for
confirmation. Remove `node_modules` and re-install.

CI does not hit this because the `node_modules` cache key includes `mise.lock`, which changes with
the pnpm version — so a pnpm bump always lands on a cache miss. Keep it that way.

### The PR has *fewer* overrides than `main` — check this every single time

*Seen 2026-07: a PR arrived with 24 of 25 security overrides silently gone.*

**The single highest-value check in this review.** The workflow clears the generated overrides and
relies on `pnpm audit --fix` to rebuild them. If that command fails, `|| true` swallows it and the
PR ships with the overrides deleted and never regenerated — no error, nothing red, just a lockfile
with every security patch quietly removed.

Always compare against `main`:

```bash
echo -n "main: "; git show origin/main:pnpm-workspace.yaml | yq '.overrides | keys | length'
echo -n "PR:   "; yq '.overrides | keys | length' pnpm-workspace.yaml
```

A drop is a blocker. Root cause seen so far: pnpm 11 requires a *value* for `--fix`
(`override` or `update`), so the bare `pnpm audit --fix` is a usage error. The workflow now uses
`--fix override` and warns instead of swallowing, but any future failure of that command has the
same silent shape.

### `ERR_PNPM_NO_MATCHING_VERSION` after `audit --fix`

`pnpm audit --fix` is not publish-aware: it will generate an override pointing at a version the
advisory recommends but that was never released. Seen with `esbuild@<=0.24.2` → `^0.24.3`, where
0.24.2 is the last 0.24.x.

Fix the single offending entry rather than clearing the block — check what `main` used for the
same advisory (`>=0.25.0` here). The workflow's fallback clears *all* generated overrides, so if
it fires you have hit the previous entry's problem as well.

---

## Build

### `MISSING_EXPORT` / rollup failures in `cloudflare-api-js`

*Seen 2026-07 on pnpm 10.34.5, no longer reproducible.*

Historically `build` depended on `generate`, which ran `rimraf ./src/generated && kubb generate`
— deleting committed code and refetching upstream OpenAPI specs on every cold build. A pnpm bump
changed `@kubb`'s dual-version resolution and the regenerated output failed to build.

`build` no longer depends on `generate`. If you see codegen churn during a build, that dependency
has been reintroduced — that is the bug, not the codegen.

### `##[error]fetch failed` during `Build packages`

Same root cause: something is running `kubb generate` (network) inside a build. Generated code is
committed and refreshed by `update-openapi.yml`. Builds must not refetch specs.

---

## VS Code extension (`apps/vscode-ai-gateway`)

The most fragile surface in a dependency bump. See `verification.md` for the checks.

### `Failed to parse semver of @types/vscode`

`vsce` reads dependency versions straight out of `package.json` and does **not** understand pnpm's
`catalog:` protocol. `@types/vscode` therefore has to carry a literal version.

Because `cleanupUnusedCatalogs: true`, removing the last `catalog:` reference also drops the
catalog entry — expect that in the diff, it is correct.

### `@types/vscode X greater than engines.vscode ^Y`

`vsce` requires `engines.vscode` >= the `@types/vscode` version. **These are coupled and the bot
bumps only one of them.** When the weekly PR bumps `@types/vscode`, raise `engines.vscode` in
`apps/vscode-ai-gateway/package.json` to match, and note that it raises the minimum VS Code
version for users.

This is the single most likely way the weekly PR breaks the release, and it only surfaces at
`vsce package` — which CI does not run.

---

## Release / publish (after merge)

### `npm error 404 … you do not have permission` on every package

Packages publish via **OIDC trusted publishing**, not a token. `release.yml` deliberately does not
set `registry-url` on `setup-node`: doing so writes an `.npmrc` with an empty
`_authToken=${NODE_AUTH_TOKEN}`, which npm sends *instead of* performing the OIDC exchange, and
every publish 404s. If someone "helpfully" re-adds `registry-url`, this is the symptom.

### `ENEEDAUTH` for one package only

OIDC cannot bootstrap a package that does not exist on npm yet — a trusted publisher can only be
attached to an existing package. Either publish it once manually, or mark it `private: true`
(what `@sferadev/platform-sdk` does).

### Marketplace publish reports success but the version is not live

`vsce publish` returns 0 at **upload**; the Marketplace then validates asynchronously (observed
~6 minutes). A green Release job does not prove the extension shipped. Verify:

```bash
curl -sS -X POST "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery" \
  -H "Content-Type: application/json" -H "Accept: application/json;api-version=7.2-preview.1" \
  -d '{"filters":[{"criteria":[{"filterType":7,"value":"SferaDev.vscode-extension-vercel-ai"}],"pageSize":1,"pageNumber":1}],"flags":17}'
```

`flags:17` lists all versions; `flags` including `512` returns only the latest and will mislead
you.

---

## CI mechanics

### PR shows no checks at all

Bot-authored PRs need workflow approval — see step 1 of `SKILL.md`. `mergeStateStatus` reports
`BLOCKED` with no checks pending.

### `Check` passes locally but not in CI (or vice versa)

`pnpm check` = `biome check .` + `knip` + `turbo run is-tree-shakable`. Every app must be
registered in `configs/knip.json` or knip fails. Turbo caching can hide a real failure locally —
re-run with `--force`.
