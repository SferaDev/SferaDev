# Pin governance

The holds that keep this repo away from "latest". Each exists for a reason that is not obvious
from the diff, which is why each carries a comment in the file. **Re-vet them every review**, and
if you release one, delete its comment in the same change.

Enumerate them from the files, never from this document:

```bash
grep -n "pnpm = " mise.toml
grep -n -A3 "^overrides:" pnpm-workspace.yaml
grep -n "catalogMode\|cleanupUnusedCatalogs" pnpm-workspace.yaml
grep -n '"@types/vscode"\|"vscode":' apps/vscode-ai-gateway/package.json
```

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

Current holds (2026-07 — verify against the file, not this list):

- **`typescript`** at 6.x. TypeScript 7 dropped the JavaScript compiler API `bunchee` uses to emit
  declarations, so every package build fails with *"Detected TypeScript 7.0.2 … install
  `@typescript/typescript6`"*. Note bunchee's peer range already advertises `^7.0`, so the peer
  range is not evidence — build a package before releasing this hold.
- **`@kubb/renderer-jsx`** must track the other `@kubb/*` entries rather than its own latest; kubb
  publishes it ahead of `adapter-oas`/`core`, and `@kubb/core` peer-requires the exact matching
  version.
- **`@types/vscode`** — see the section below; it is coupled to `engines.vscode`.

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
