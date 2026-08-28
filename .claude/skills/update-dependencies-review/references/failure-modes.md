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

A drop is a blocker. Two root causes have been found and both are now fixed in the workflow: pnpm
11 requires a *value* for `--fix` (`override` or `update`), so the bare `pnpm audit --fix` was a
usage error swallowed by `|| true`; and the post-`audit` install fallback cleared the whole block
instead of restoring the committed one (see the `ERR_PNPM_NO_MATCHING_VERSION` entry below).

**Keep running this check anyway.** It is two commands, it is the cheapest possible confirmation
that those guards still work, and the failure it catches is invisible by construction.

### `ERR_PNPM_NO_MATCHING_VERSION` after `audit --fix` — the `overrides: {}` PR

**`pnpm audit --fix` is not publish-aware.** It generates entries pointing at whatever version an
advisory recommends, including versions that were never released. When one of those reaches an
install, the install fails and the workflow's fallback clears *every* generated override — so the
PR ships with the whole security block gone and nothing red.

**Fired three times with an identical fix: 2026-08 (#594), 2026-08-10 (#601), 2026-08-17 (#626) —
always `esbuild@^0.24.3`** (0.24.2 is the last 0.24.x). It is intermittent, not weekly: it needs
something in the freshly-resolved tree to drop back to esbuild ≤0.24.2 while the override that
normally holds esbuild at 0.25.x has already been cleared. In #601 the path was
`drizzle-kit → @esbuild-kit/esm-loader → esbuild`.

> **Fixed at the source in #626 — so `overrides: {}` should never appear again.** The workflow now
> snapshots the committed overrides before it touches anything, drops generated entries whose
> target resolves to no published version (`npm view` per new entry), merges the committed set
> underneath the generated one so the block can only grow, falls back to the *committed* overrides
> rather than to empty when the install still fails, and hard-fails the job if the count ever
> shrinks. It also reports both the dropped entries and any fallback in the **PR body**, not just
> the run log.
>
> **So a PR that still arrives with fewer overrides than `main` now means one of those guards is
> broken, not that `audit --fix` misbehaved.** Read the run log for `::error::security overrides
> shrank` and treat it as a bug in `update-dependencies.yml`. The recovery below is still the right
> manual fix; it is just no longer expected to be needed.

Historically the first hypothesis whenever a PR arrived with `overrides: {}` — confirm from the
bot's own run log rather than inferring:

```bash
gh run list --workflow=update-dependencies.yml --limit 1     # get the run id
gh run view <id> --log | grep -E "::warning|ERR_PNPM|overrides were added"
```

`N overrides were added` followed by `ERR_PNPM_NO_MATCHING_VERSION` and `install failed after
audit --fix` means `audit --fix` worked and the **install after it** failed — so the cause is one
bad entry, not a reason to re-run `audit`. Nothing else is a reliable tell; in particular
`minimumReleaseAgeExclude` gaining or not gaining entries proves nothing either way (#601 had an
unchanged exclude list and a fully successful `audit --fix`).

Take `main`'s whole block as the base rather than re-deriving it:

```bash
git show origin/main:pnpm-workspace.yaml | yq '.overrides' > /tmp/main-overrides.yaml
yq -i '.overrides = load("/tmp/main-overrides.yaml") | .overrides style="" | .overrides[] style=""' pnpm-workspace.yaml
pnpm install
```

Then confirm the lockfile agrees (`yq '.overrides | keys | length' pnpm-lock.yaml`) and that no
banned version resolved (`grep -oE '^  esbuild@[0-9.]+' pnpm-lock.yaml | sort -u`).

**The same non-publish-awareness reaches `minimumReleaseAgeExclude`.** #626 added
`extract-zip@2.0.2`, which does not exist (latest is 2.0.1). Such an entry is inert, but it will
sit there forever un-audited, so check new excludes resolve before accepting them — one
`npm view <pkg> version` per added line:

```bash
git diff origin/main...HEAD -- pnpm-workspace.yaml | grep '^+  - '
```

### `overrides` written as one flow-style line

`pnpm audit --fix` emits `overrides` as a single `{a: b, c: d, …}` line. At 50+ entries any
change rewrites the whole line, so the diff cannot be read entry-by-entry — which is precisely how
a shrinking override set stays invisible. The workflow now re-emits it as a block map after
`audit --fix` (2026-08):

```bash
yq -i '.overrides style="" | .overrides[] style=""' pnpm-workspace.yaml
```

Purely cosmetic to pnpm — verify with a byte-identical `pnpm-lock.yaml` after
`pnpm install --frozen-lockfile`. If a future PR reverts to one line, that step was dropped.

### Every KEEP-BACK pin jumps, every run

`pnpm update --recursive --latest` has no notion of a keep-back, so **every** run bumps past
**every** pin and leaves the explaining comment stranded above the now-wrong value. Re-pinning is a
default step of this review, not a contingency.

Identical in #594, #601, #626 and #635: `typescript` 6.0.3 → 7.0.2 **and** the `@kubb/*` set,
together, every time.

Only the TypeScript one turns CI red; the `@kubb` one is an unmet peer that no gate catches — so
**re-check every pin, not just whichever one broke the build.** A green `Check` is not evidence the
other holds survived. `grep -n "KEEP-BACK" -A6 pnpm-workspace.yaml` and compare each value, then
verify what actually resolved (an override can defeat a re-pin — see `pin-governance.md`).

The TypeScript hold is still required as of 2026-08-28: bunchee 7.0.1 (still the latest) fails all
12 package builds on TS 7.0.2 with "Detected TypeScript 7.0.2 … install `@typescript/typescript6`".
Do not take bunchee's own suggested escape hatch as a weekly fix: adopting `@typescript/typescript6`
means running the whole repo on TS 7, and **`tsc` is not in CI**, so the bump would be entirely
unverified. Note `@kubb/plugin-ts` also depends on `typescript: ^6.0.3`.

### A KEEP-BACK on a *set* of packages fragments instead of jumping cleanly

*Seen 2026-08-28 (#635), the `@kubb/*` family.* Worth its own entry because the symptom is
different from a single stranded pin: the bot bumped `adapter-oas`/`cli`/`core`/`renderer-jsx`/
`kubb` to 5.0.2, `plugin-ts` to 5.0.0 and `plugin-zod` to 5.1.0, while **`plugin-client` stayed at
5.0.0-beta.10** — because `@kubb/plugin-client`'s npm `latest` is still on the 4.x line (4.39.3),
which is semver-lower than a 5.0.0 prerelease, so `--latest` had nowhere to move it.

`@kubb/*` packages depend on each other by **exact** version, and `@kubb/plugin-client@5.0.0-beta.10`
hard-depends on core/plugin-ts/plugin-zod/renderer-jsx at beta.10 — so the split puts **two
`@kubb/core` copies** in the tree. `packages/openapi-utils/src/kubb/**` imports types from all of
them in single files, which is the historical "dual-version resolution" breakage.

**The generalisation:** when a keep-back covers a family that must move in lockstep, check *every*
member of the family, not just the one the comment happens to sit above — and make the comment name
the whole set. A partially-bumped set is easy to miss because each individual line looks plausible.

```bash
grep -nE "^  '?@?kubb" pnpm-workspace.yaml          # every member must show the same version
grep -oE "^  '@kubb/[a-z-]+@[0-9a-zA-Z.-]+" pnpm-lock.yaml | sort -u   # one version, not two
```

Release the hold only when `@kubb/plugin-client` publishes a stable 5.x.

---

## Tests

### `ai-gateway-proxy` integration tests fail locally with `GatewayAuthenticationError`

*Seen 2026-08.* `packages/ai-gateway-proxy/vitest.config.ts` calls dotenv's `config()`, so an
untracked `packages/ai-gateway-proxy/.env` is loaded even when the shell has no
`AI_GATEWAY_API_KEY`. A stale key in that file flips `hasApiKey` to true, the
`describe.skipIf(!hasApiKey)` block runs, and 11 tests fail — 8 with
`GatewayAuthenticationError`, 3 with downstream `expected 0 to be greater than 0` /
`AI_NoOutputGeneratedError` from streams that never produced tokens.

**This is local-only and not a regression** — CI has no `.env` and no secret, so it reports
`13 skipped` and goes green. Confirm which you are looking at before blaming an `ai` /
`@ai-sdk/*` bump:

```bash
ls -la packages/ai-gateway-proxy/.env
mv packages/ai-gateway-proxy/.env packages/ai-gateway-proxy/.env.localbak
pnpm --filter ai-gateway-proxy test    # expect "13 skipped" — matches CI
mv packages/ai-gateway-proxy/.env.localbak packages/ai-gateway-proxy/.env
```

The corollary is the uncomfortable one: an expired key looks exactly like a broken bump, and a
*valid* key is the only thing that distinguishes them. Absent one, the AI SDK bump is unverified —
say so rather than reading the skips as a pass.

---

## Runtime — a bump that needs a database migration

### A minor bump requires a schema change nothing in CI can see

*Seen 2026-08-28 (#635): `better-auth` 1.6.29 → **1.7.2**.*

The most dangerous shape in this review: a **minor** version step that carries breaking changes and
a **database migration**. It compiles, `pnpm check` and `pnpm test` are green, the Vercel preview
deploys — and the app fails the first time the library touches the table.

better-auth 1.7.0 rescoped account identity onto `(issuer, accountId)`. `@better-auth/core`'s table
definition marks `account.issuer` as `required: true` and adds a unique index on
`["issuer", "accountId"]`. `apps/platform/src/db/schema.ts` defines `accounts` with no `issuer`
column, `apps/platform/drizzle/` has no migration adding one, and 1.7 additionally documents an
account-identity **backfill** to run before deploying. Held at 1.6.29.

**The generalisable move — read the installed artifact, not the changelog.** For any library that
owns a schema, the shipped table definition is the authoritative answer and takes one grep:

```bash
# what the new version actually requires
grep -rn "issuer\|required: true" node_modules/.pnpm/@better-auth+core@*/node_modules/@better-auth/core/dist/db/get-tables.mjs
# what the repo actually has
grep -n -A20 "pgTable(\"accounts\"" apps/platform/src/db/schema.ts
ls apps/platform/drizzle/
```

Apply the same suspicion to any bump of `drizzle-orm`, `better-auth`, or a plugin of theirs:
**does the new version want a column, index or table that the committed schema does not have?**
If yes, keep it back — migration first, bump second — and say so in the PR description, because a
green board is actively misleading here.

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

### A pinned Action crosses a major and the workflow keeps the old input names

*Seen 2026-08-17 (#626): `changesets/action` v1.9.0 → v2.1.0.*

**Workflow diffs are not always benign SHA re-pins.** `pinact` re-pins by SHA, and the comment
beside it is the only thing revealing that the tag moved a whole major. v2.0.0 renamed every root
input — `publish` → `publish-script`, `version` → `version-script`, `commit` → `commit-message`,
`title` → `pr-title`, `branch` → `pr-base-branch` — and **GitHub Actions silently ignores unknown
`with:` keys.** So `release.yml` kept `publish: pnpm release`, the input was dropped on the floor,
and the job would have stopped publishing npm packages *and* the VS Code extension while still
going green — it just opens a version PR instead. v2 also stopped reading a custom token from the
`GITHUB_TOKEN` env var; it must be passed to the `github-token` input, so `secrets.GIT_TOKEN` was
being ignored too.

**So: read the version comment on every Action bump in the diff, and for any major, diff the
action's own input list rather than the release notes alone** — it is the authoritative list, and
unknown keys will never tell you:

```bash
gh api repos/<org>/<action>/tarball/<new-sha> > /tmp/a.tgz
mkdir -p /tmp/a && tar xzf /tmp/a.tgz -C /tmp/a --strip-components=1
sed -n '/^inputs:/,/^outputs:/p' /tmp/a/action.yml
grep -nE '^\s+(with|uses|env):' -A8 .github/workflows/release.yml
```

Note this class is invisible to every gate: `release.yml` runs only on push to `main`, so the fix
can be reviewed but not proven until the next merge. Say so in the PR description.

### A tool major changes a default that silently invalidates repo config

*Seen 2026-08-17 (#626): `@changesets/cli` 2.31.1 → 3.0.0.*

v3 stopped versioning private packages by default. `packages/openapi-utils` and
`packages/platform-sdk` are `private: true`, and five published API clients depend on
`@sferadev/openapi-utils` — a tree changesets then refuses outright:

```
Invalid tree: "netlify-api" depends on the skipped package "@sferadev/openapi-utils",
but "netlify-api" is not skipped. Please add "netlify-api" to the "ignore" option.
```

Restored the previous behaviour explicitly rather than reshuffling `ignore`:
`"privatePackages": { "version": true, "tag": false }` in `.changeset/config.json`.

The general move: **a dev tool's config is a gate nothing else runs**, so exercise it directly
after any major of a tool that reads committed config. One command is usually enough:

```bash
pnpm changeset status --since=main     # exits 1 and prints the tree error
```

Also bump the config's `$schema` URL to match the installed major (`@changesets/config@4` here) —
the bot never does, and a stale schema silently stops validating new options.

**Related, pre-existing and out of scope but worth an issue:** `vercel-api-js` and four siblings
publish with `"@sferadev/openapi-utils": "0.0.1"` in `dependencies`, while that package is
`private: true` and 404s on npm — so those published packages are not installable. Confirm with
`npm view vercel-api-js dependencies` before treating any of it as new.

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

## After merge

### `ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY` on `main` — two green PRs that collide

*Seen 2026-08-10: #601 (weekly bump) and #604 (added `better-auth`) both merged green; `main` then
failed every Vercel build with*

```
[ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY] Broken lockfile: no entry for
'better-auth@1.6.26(f7e487ef02675d984ba7001fb84f91a1)' in pnpm-lock.yaml
```

pnpm records a dependency in `importers` as `version(<hash-of-resolved-peer-set>)`. #604 added
`better-auth` and recorded one hash; #601 had branched earlier and bumped `pg`, which is *in* that
peer set, so the correct hash changed. Each lockfile was valid on its own branch, git merged them
with **no textual conflict**, and the result was a one-line inconsistency.

**Why no gate caught it:** every CI job installs with `--frozen-lockfile`, which trusts the
recorded importer entry instead of re-resolving. Both PRs were legitimately green, and the failure
only appears where an install happens from scratch — the deploy.

The fix is `pnpm install` on `main` and committing the regenerated lockfile; expect a **one-line**
diff, and treat a larger one as a sign something else drifted.

**The general rule:** the weekly PR sits open for hours and is a lockfile-wide diff, so *any* PR
merging a manifest change in the meantime can desync it. Before merging the dependency PR, check
whether anything touched a `package.json` since it was branched, and rebase if so:

```bash
git log --oneline origin/main --since="$(git log -1 --format=%cI $(git merge-base HEAD origin/main))" -- '*/package.json'
```

Non-empty output → rebase on `main` and re-run `pnpm install` before merging. This is cheaper than
a broken `main`, and it is the one failure mode in this file that **a green board actively hides**.

---

## CI mechanics

### PR shows no checks at all

Bot-authored PRs need workflow approval — see step 1 of `SKILL.md`. `mergeStateStatus` reports
`BLOCKED` with no checks pending.

### `Check` passes locally but not in CI (or vice versa)

`pnpm check` = `biome check .` + `knip` + `turbo run is-tree-shakable`. Every app must be
registered in `configs/knip.json` or knip fails. Turbo caching can hide a real failure locally —
re-run with `--force`.
