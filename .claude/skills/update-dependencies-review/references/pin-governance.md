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

`mise.toml` tracks pnpm as `"10"` — a major line, not an exact pin — and the workflow updates it
with `mise up pnpm` while every other tool gets `mise up --bump`:

```bash
bumpable=$(yq -p toml -oy -r '.tools | keys | .[] | select(. != "pnpm")' mise.toml | tr '\n' ' ')
mise up --bump $bumpable
mise up pnpm
```

So pnpm still receives 10.x releases weekly; only the major is held.

**Why:** pnpm 11 fails installs on ignored build scripts, renames `onlyBuiltDependencies` to
`allowBuilds`, and — the reason this is a hold rather than a quick fix — stops reading the `pnpm`
field in package.json, silently dropping every security override.

**To release it** (a deliberate PR, never a weekly bump):

1. Move `pnpm.overrides` from `package.json` into `pnpm-workspace.yaml` `overrides`, merging with
   the manual `@kubb/renderer-jsx` pin already there.
2. Convert `onlyBuiltDependencies` to `allowBuilds`, deciding explicitly per package. Letting pnpm
   write it for you (it records ignored builds on the failing install) is a reasonable start, but
   read what it wrote.
3. Rework the workflow's override-clearing step. It currently clears `package.json` overrides with
   `jq`; a naive `yq 'del(.overrides)'` on `pnpm-workspace.yaml` would also delete the manual
   `@kubb` pin, which `audit --fix` will never regenerate. Clear only the generated entries.
4. **Prove the security overrides still apply** afterwards — that is the whole point:
   ```bash
   grep -oE 'hono@[0-9.]+|lodash@[0-9.]+' pnpm-lock.yaml | sort -u
   ```
5. Check `mise.lock` still has all 7 platform entries (CI runs `linux-x64`).

Do not release this hold just because pnpm 11 has been out a while. Release it when steps 1–4 are
done and verified.

---

## The `@kubb/renderer-jsx` override

`pnpm-workspace.yaml`:

```yaml
overrides:
  '@kubb/renderer-jsx': 5.0.0-beta.10
```

A **manual** override forcing a single version, because `@kubb/adapter-oas` pins
`@kubb/core@5.0.0-beta.10` which wants exactly `@kubb/renderer-jsx@5.0.0-beta.10`, while the
catalog carries a newer beta. Without it, the peer set is unsatisfiable.

Two things to know:

- `pnpm audit --fix` will never regenerate it. Anything that clears `overrides` wholesale
  destroys it permanently.
- It lives in `pnpm-workspace.yaml`, while *security* overrides live in `package.json`
  `pnpm.overrides`. That split is deliberate: the workflow clears only the latter. Keep it.

**To release it:** when the catalog's `@kubb/*` packages all sit on one version again, drop the
override and confirm `pnpm install` reports no unmet `@kubb` peer.

---

## `catalogMode: strict`

Not a hold, but it constrains every bump. Strict mode requires each dependency to match its
catalog entry exactly, which is why `pnpm update --latest` cannot run unattended — see the
`ERR_PNPM_CATALOG_VERSION_MISMATCH` entry in `failure-modes.md`.

The workflow relaxes it to `manual` for the bump and restores `strict` immediately after. If a PR
diff leaves `catalogMode: manual` committed, that is a bug in the run — restore it.

`cleanupUnusedCatalogs: true` means a catalog entry disappears as soon as its last `catalog:`
reference does. Expect that when a package moves to a literal version, and do not treat it as an
accidental deletion.

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
