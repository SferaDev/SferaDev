---
name: update-dependencies-review
description: Review, fix and green-light the weekly automated "Update dependencies" PR (branch update-dependencies-<run_id>, opened by SferaDev Bot). Use when asked to review a dependency update PR, fix its red CI, investigate a failing dependency bump, re-vet a held-back version, debug the weekly job itself, or regression-test previews before approving a bump. Covers the pnpm catalog/overrides model, the mise toolchain hold, recurring bot failure modes, the VS Code extension's packaging constraints, and the npm publish path.
---

# Update Dependencies Review

The weekly bot (`.github/workflows/update-dependencies.yml`, Mondays 07:00 UTC) opens a PR
titled **"Update dependencies"** on branch `update-dependencies-<run_id>`. It bumps the mise
toolchain, the `pnpm-workspace.yaml` catalog, regenerates `pnpm-lock.yaml`, re-derives security
`overrides` via `pnpm audit --fix`, migrates the biome config, and re-pins GitHub Action SHAs.

The job: understand the bumps, make CI green, verify what CI cannot see, and leave a summary.

## Non-negotiables

1. **A green build is not a green runtime.** CI runs `pnpm check` and `pnpm test` only — no
   typecheck, no deploy-preview exercise. The regressions that hurt compile fine.
2. **Derive current state from the repo, never from this skill.** Every version named in
   `references/` is dated evidence of a *class* of failure, not a claim about today. Re-read the
   actual files each run.
3. **Distrust silence.** The worst failure this repo has hit did not error — pnpm 11 silently
   stopped reading `pnpm.overrides`, which would have dropped every security override. When a
   tool changes major, ask what it stopped doing, not just what it broke.
4. **`turbo` caches mask failures.** Use `--force` (or `TURBO_FORCE=true`) before trusting a
   local pass. A cached `check` proves nothing about the new lockfile.
5. **Stay in scope.** A dependency PR bumps dependencies. If a bump surfaces a wider refactor,
   pin the dependency back with a tracking comment and raise the refactor separately.
6. **Update this skill.** It is re-used every week. When you learn a new failure mode, add it to
   `references/failure-modes.md` — dated, as a class — and commit that with the dependency PR.

## Workflow

### 1. Set up

```bash
git fetch origin
gh pr list --repo SferaDev/SferaDev --head update-dependencies-<run_id> --json number,url
gh pr checks <num>
gh run view --job=<id> --log-failed
```

`--log-failed` often shows only the shared setup step. If a job died during install, grep the
full `--log` for `ERR_PNPM`.

**CI on bot PRs usually needs approving before it runs at all.** Runs sit in `action_required`:

```bash
gh run list --branch update-dependencies-<run_id>          # look for action_required
gh api -X POST repos/SferaDev/SferaDev/actions/runs/<id>/approve
```

A PR showing no checks is normally this, not a passing build. The required check is **`Check`**
(repo ruleset on `main`); everything else is advisory.

### 2. Triage what broke

Read **[references/failure-modes.md](references/failure-modes.md)** — a symptom-keyed catalog of
what has actually broken here, with the fix and how to verify it. Grep it for the error string
before investigating from scratch.

### 3. Re-vet the holds

Some things are deliberately held below latest. They are load-bearing and the comments explaining
them are the only thing stopping someone reverting them.

```bash
grep -n "pnpm = " mise.toml                    # pnpm major hold
grep -n "overrides" -A3 pnpm-workspace.yaml    # manual @kubb pin
```

Follow **[references/pin-governance.md](references/pin-governance.md)** for what each hold is,
how to test whether it can be released, and the traps (an override silently defeating a pin; the
bot bumping past a pin and leaving the comment behind).

### 4. Review the bumps

Skim the `pnpm-workspace.yaml` catalog diff and triage by blast radius:

- **Majors first**, then runtime-facing libraries (next, react, ai/@ai-sdk, better-auth, drizzle,
  effect, kubb, tailwind), then patch/minor.
- For majors, read the changelog across the **whole range**, and ask what the major *removed* or
  stopped reading — not only what it renamed.
- Audit **new `overrides` entries** the bot added. `pnpm audit --fix` is not compatibility-aware
  and will happily force a transitive dependency across a major boundary.
- `mise.toml` / `mise.lock` diffs: check node did not cross a major the code is not ready for,
  and that `mise.lock` still carries all platforms (CI needs `linux-x64`).
- Workflow diffs are normally just pinned Action SHA bumps — benign.

### 5. Local CI parity

```bash
pnpm install --frozen-lockfile
pnpm check                                  # biome + knip + is-tree-shakable — the required gate
pnpm test
pnpm turbo run build --filter="./packages/*" --force
```

`pnpm check` and `pnpm test` are exactly what CI gates on. The forced build is not in CI but
catches real breakage cheaply.

Known-noisy locally: `ai-gateway-proxy`'s integration test needs `AI_GATEWAY_API_KEY` and fails on
`main` too — CI has the secret. Confirm a failure reproduces on `main` before blaming the bump.

The bot adds no changeset. There is no changeset gate in CI, so only add one if a bump genuinely
changes published behaviour of a package in `packages/*`.

### 6. Verify what CI does not

**Do not skip.** Follow **[references/verification.md](references/verification.md)** for the
VS Code extension packaging constraints (the most fragile surface here), the publish path, and
which preview surfaces to exercise for which dependency families.

### 7. Finish

Iterate until `Check` is green and the surfaces in step 6 hold, then comment on the PR
(`gh pr comment <num> --body-file <file>`): what was held back and why, what broke and the fix,
what you verified and what you could not. Write it for the next reviewer, not as a play-by-play.

Then fold anything new into `references/failure-modes.md`.
