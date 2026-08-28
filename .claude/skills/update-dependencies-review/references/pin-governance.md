# Pin governance

The holds that keep this repo away from "latest". Each exists for a reason that is not obvious
from the diff, which is why each carries a comment in the file. **Re-vet them every review**, and
if you release one, delete its comment in the same change.

Enumerate them from the files, never from this document:

```bash
grep -n "pnpm = " mise.toml
grep -n -A3 "^overrides:" pnpm-workspace.yaml
grep -n "catalogMode\|cleanupUnusedCatalogs" pnpm-workspace.yaml
grep -n "KEEP-BACK\|TEMPORARY" pnpm-workspace.yaml
grep -n '"@types/vscode"\|"vscode":' apps/vscode-ai-gateway/package.json
```

And read the diff for **deletions**, not only bumps. `pnpm audit --fix` rewrites the whole
`overrides` block, so it drops hand-added lines and their comments silently:

```bash
git diff origin/main...HEAD -- pnpm-workspace.yaml | grep '^-'
```

A removed override with no replacement is a regression *unless* the catalog already satisfies it —
check the catalog value before restoring.

---

## The pnpm major hold

`mise.toml` tracks pnpm as a **major line** (`"11"` as of 2026-07), not an exact pin, and the
workflow updates it with `mise up pnpm` while every other tool gets `mise up --bump`:

```bash
bumpable=$(yq -p toml -oy -r '.tools | keys | .[] | select(. != "pnpm")' mise.toml | tr '\n' ' ')
mise up --bump $bumpable
mise up pnpm
```

So pnpm still receives releases within the major every week; only the major crossing is held.

**Why:** a pnpm major is a migration, not a bump. v10 → v11 moved `overrides` out of package.json,
renamed `onlyBuiltDependencies` to `allowBuilds`, and made ignored build scripts fail the install.
The first of those produced no error at all — it would simply have stopped applying every security
override. Assume the next major has an equivalent silent change.

**Crossing the next major** (a deliberate PR, never a weekly bump). What v11 needed, as a template:

1. Relocate any config the new major stopped reading. For v11 that was
   `package.json` `pnpm.overrides` → `pnpm-workspace.yaml` `overrides`, merged with the manual
   `@kubb/renderer-jsx` pin already living there.
2. Convert renamed settings, deciding explicitly rather than accepting defaults. For v11,
   `onlyBuiltDependencies` → `allowBuilds`; pnpm writes `set this to true or false` placeholders
   for every undecided package, and the install keeps failing until each is resolved. Encode the
   *existing* behaviour unless you mean to change it.
3. Check the weekly workflow's assumptions still hold. Its override-clearing step targeted
   package.json, which v11 made a no-op. Note a blanket `yq 'del(.overrides)'` would delete the
   manual `@kubb` pin, which `audit --fix` never regenerates — clear only generated entries.
4. **Prove the security overrides still apply.** This is the whole point:
   ```bash
   yq '.overrides | keys | length' pnpm-lock.yaml     # expect the full count, 25 in 2026-07
   grep -oE '^  hono@[0-9.]+|^  lodash@[0-9.]+' pnpm-lock.yaml | sort -u
   ```
   The strongest signal is `pnpm-lock.yaml` coming out **unchanged**: config moved, resolutions
   did not.
5. Regenerate `mise.lock` and confirm all platform entries survive (CI runs `linux-x64`).
6. Wipe `node_modules` before testing locally — pnpm aborts with
   `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` when it wants to replace a store written by a
   different major and has no TTY. CI is safe because the `node_modules` cache key includes
   `mise.lock`, which changes with the pnpm version.

---

## Keep-backs in the catalog

Catalog entries held *below* latest, each with a comment saying why. `pnpm update --latest` bumps
straight past them and leaves the comment behind, still reading as if the hold were in force — so
**re-pin them every review**:

```bash
grep -n "KEEP-BACK" -A5 pnpm-workspace.yaml
```

Current holds (2026-08-28 — verify against the file, not this list):

- **`@types/vscode`** — see the section below; it is coupled to `engines.vscode`.

**All three long-standing holds were released on 2026-08-28 (#635)**, so the catalog now tracks
latest for `typescript`, the `@kubb/*` family and `better-auth`. What each release cost, because
the next reviewer will see the bump and want to know whether it is safe to keep taking it:

- **`typescript` 6 → 7** — released by adding **`@typescript/typescript6`** as a root
  devDependency. bunchee 7.0.1 has no native TS 7 declaration path and looks for that shim by
  name; with it installed every build logs *"Using @typescript/typescript6 API for TypeScript
  7.0.2 type declaration generation"*. **Treat that log line as the regression test** — if bunchee
  ever stops printing it, declarations are being emitted by some other path and the `.d.ts` output
  needs re-checking. Keep the shim until bunchee ships native TS 7 support. knip cannot see the
  edge (nothing imports it), so it is listed in `ignoreDependencies` in `configs/knip.json`.
- **the `@kubb/*` family, beta.10 → 5.0.3 stable** — see the migration entry in
  `failure-modes.md`. `@kubb/plugin-client` never shipped a stable 5.x and was replaced by a local
  plugin, so the catalog no longer carries it, nor `@kubb/core`/`@kubb/cli`/`@kubb/renderer-jsx`
  (all re-exported through `kubb`).
- **`better-auth` 1.6 → 1.7** — released with the `account.issuer` migration + backfill in
  `apps/platform/drizzle/0001_*.sql`. The hold existed only because that migration did not exist.

## The `@kubb/renderer-jsx` override (released 2026-07)

There used to be a manual override forcing `@kubb/renderer-jsx` to `5.0.0-beta.10` while the
catalog carried a newer beta. **It has been removed** — and how it failed is the lesson.

An override that contradicts a catalog entry for the same package is not a stable arrangement. In
the `catalogMode: manual` window the workflow opens for the bump, pnpm resolves the contradiction
by writing a literal version into the consuming manifest; `cleanupUnusedCatalogs` then deletes the
orphaned catalog entry, and the package silently stops being catalog-managed. See
`ERR_PNPM_OUTDATED_LOCKFILE` in `failure-modes.md`.

The fix was to make the catalog agree with the override (`beta.10`, matching every other `@kubb/*`
entry) rather than have the two fight. The override then became redundant — verified by removing
it and confirming a single `@kubb/renderer-jsx@5.0.0-beta.10` still resolves with no unmet peer.
Aligning them also removed a duplicate copy from the tree.

**Rule of thumb:** if you are tempted to add an override for a package that also has a catalog
entry, change the catalog entry instead. Reach for an override only for something you do not
control directly — a transitive dependency.

### An override can silently defeat a pin

`pnpm audit --fix` can add an override that forces a held-back package **back up** past its pin.
Restoring the catalog value is then a no-op and the regression ships anyway. After **any** re-pin,
verify what actually resolved rather than trusting the catalog edit:

```bash
grep -oE '^  <pkg>@[0-9.]+' pnpm-lock.yaml | sort -u
```

If an override is fighting a pin, narrow or drop it and leave a comment saying the bot will re-add
it and it must not be restored — otherwise this costs a debugging cycle every week.

---

## `minimumReleaseAge` — the gate the exclude list turns off

`minimumReleaseAge` is supply-chain protection: pnpm refuses to *resolve* a version published
inside that window, so a compromised release has to survive review time before it can reach us.
Every line in `minimumReleaseAgeExclude` turns that protection off for one package, and the bot
adds entries freely — `audit --fix` appends one for every patched version it wants.

**Read the current state from the file every review** (`grep -n -A30 "minimumReleaseAgeExclude"
pnpm-workspace.yaml`); the list grows week over week and nothing prunes it.

### This repo does not set `minimumReleaseAge` (verified 2026-08)

`minimumReleaseAge` is **not** configured — not in `pnpm-workspace.yaml`, not in `.npmrc`
(`pnpm config get minimumReleaseAge` → `undefined`). Two consequences, and the second is the
one that bites:

1. pnpm 11 defaults it to **1440 minutes (1 day)**, so a gate *is* active — which is why the bot
   keeps appending excludes.
2. `minimumReleaseAgeStrict` defaults to **`true` only when `minimumReleaseAge` is set
   explicitly**, and `false` otherwise. Unset means **non-strict**: when nothing in range
   satisfies the window, pnpm quietly **falls back to a non-compliant version** instead of
   failing.

So the protection is softer than a 19-entry exclude list implies, and most of those entries are
belt-and-braces rather than load-bearing. Setting `minimumReleaseAge` explicitly (even to the same
1440) would flip strict mode on and make the gate real — **that is a deliberate PR, not a weekly
bump**, because it converts today's silent fallbacks into hard resolution failures.

### Rules for the list

1. **Only trusted-publishing packages should be excluded.** Un-gating a package whose releases are
   pushed with a long-lived npm token is exactly the attack the window absorbs.
   ```bash
   npm view <pkg>@<ver> _npmUser.trustedPublisher --json
   ```
   Trusted publishing prints an object and `_npmUser` reads
   `GitHub Actions <npm-oidc-no-reply@github.com>`; anything else prints nothing, and
   `npm view <pkg>@<ver> _npmUser` names the human account that pushed the tarball. Do **not**
   settle for provenance/attestations — `npm publish --provenance` attaches those to token
   publishes too.
2. **Retire aged-out entries.** An exclude only needs to exist until its version clears the window.
   ```bash
   npm view <pkg>@<ver> time --json   # read the "<ver>" key
   date -u
   ```
   Published longer ago than the window → delete the line in this PR. Entries quietly becoming
   permanent is the failure this guards against; each one is a package running un-gated forever.
3. **Keep the permanent tier small.** "The bot wanted a newer version" is a temporary, not a
   promotion.

---

## `catalogMode: strict`

Not a hold, but it constrains every bump. Strict mode requires each dependency to match its
catalog entry exactly, which is why `pnpm update --latest` cannot run unattended — see the
`ERR_PNPM_CATALOG_VERSION_MISMATCH` entry in `failure-modes.md`.

The workflow relaxes it to `manual` for the bump and restores `strict` immediately after. If a PR
diff leaves `catalogMode: manual` committed, that is a bug in the run — restore it.

`cleanupUnusedCatalogs: true` means a catalog entry disappears as soon as its last `catalog:`
reference does. That is fine when *you* deliberately moved a package to a literal version (as
`@types/vscode` had to be, for `vsce`).

It is **not** fine when the bot does it. A disappearing catalog entry in a bot PR usually means a
`catalog:` reference was rewritten to a literal during the bump — a package silently leaving the
catalog. Check before accepting any catalog deletion:

```bash
git diff origin/main -- '*/package.json' | grep -E '^\-.*"catalog:"'
```

---

## `@types/vscode` ↔ `engines.vscode`

`apps/vscode-ai-gateway/package.json` carries `@types/vscode` as a **literal** version (not
`catalog:`) because `vsce` cannot parse the catalog protocol, and `engines.vscode` must be **>=**
that version or `vsce package` refuses to build.

The bot bumps `@types/vscode` and leaves `engines.vscode` alone, so **every bump of that package
needs a matching `engines.vscode` raise**. Raising it also raises the minimum VS Code version for
users, so it is a real decision, not a rubber stamp: if the new API surface is not needed, prefer
holding `@types/vscode` back instead.

Verify with `pnpm --filter vscode-extension-vercel-ai package`, which CI does not run.
