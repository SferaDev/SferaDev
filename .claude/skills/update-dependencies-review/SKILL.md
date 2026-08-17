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
6. **Semver is not evidence.** The version step is a claim by the publisher, not proof. Triage
   decides *how deep* to read, never *whether* to look — regressions here have shipped as a patch
   and as a "no breaking changes" minor.
7. **Prefer fixing the cause over keeping back.** A keep-back is the fallback, not the first move.
   When a bump exposes a genuine upstream bug, reproduce it and open the upstream issue/PR, then
   pin with a `# TEMPORARY` comment naming it so the next run bumps forward instead of
   re-litigating. A `# KEEP-BACK` is for holds with no forward path yet.
8. **Update this skill — both halves.** It is re-used every week, so it decays if it only ever
   grows. **Add** each new finding to `references/failure-modes.md`, dated, as a class with the
   symptom string the next reviewer would grep for. **Prune** in the same pass: merge two entries
   describing one root cause, delete guidance the repo has outgrown, and fix anything this run
   proved wrong — stale instructions are worse than missing ones, because they get followed.
   Commit skill changes with the dependency PR.

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

Every job installs first, so **one install failure paints the whole board red** — fix install
before reading anything else as a signal.

**An all-green board is not a light week.** CI cannot see a stranded keep-back, a deleted override,
or an unmet peer — and all three have shipped. When everything passes, go to step 3 *first* and
read harder, not faster.

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

Before the catalog diff, run the two checks that catch silent damage — both have fired for real:

```bash
# 1. security overrides must not shrink
echo -n "main: "; git show origin/main:pnpm-workspace.yaml | yq '.overrides | keys | length'
echo -n "PR:   "; yq '.overrides | keys | length' pnpm-workspace.yaml

# 2. no package may quietly leave the catalog
git diff origin/main -- '*/package.json' | grep -E '^\-.*"catalog:"'
```

Then work the `pnpm-workspace.yaml` catalog diff. For each entry, go down this list until you can
say what changed and why it is safe — stopping early is a triage decision, not a default:

1. **Release notes across the whole range**, not just the newest version.
   `gh api repos/<org>/<repo>/releases`. Changeset monorepos keep per-package files:
   `gh api repos/<org>/<repo>/contents/packages/<pkg>/CHANGELOG.md --jq .content | base64 -d`.
2. **Upgrade / migration guide** — always for a major, and many projects document behaviour
   changes only there. Fetch current docs (Context7), do not answer from memory.
3. **The actual commits**, when the notes are thin or absent. "chore: update deps" is a reason to
   look, not to move on:
   `gh api repos/<org>/<repo>/compare/<old>...<new> --jq '.commits[].commit.message'`.
4. **The published artifact**, when source and release disagree or the package generates its
   output — `npm pack <pkg>@<ver>` for both versions and diff `dist/`.
5. **Its own manifest** — `npm view <pkg>@<ver> dependencies peerDependencies engines --json`, old
   vs new. A widened range can reintroduce a version a pin holds back; a raised `engines` can
   outrun the toolchain.

For a major, ask what it **removed or stopped reading**, not only what it renamed — see
non-negotiable 3.

Then close the loop against this repo rather than assuming:

- Changelog names a renamed/removed API → grep for it. One line of evidence turns most entries
  into a fast "we don't use this".
- Codegen tool (`kubb`) → generated code is committed; confirm no diff, and see the Build section
  of `failure-modes.md` about builds that re-run codegen.
- Build/bundler tool (`bunchee`, `rollup`, `turbo`) → the risk is what it *emits*. Build a package
  and import the output.

Depth by blast radius: majors and runtime-facing libraries (next, react, ai/@ai-sdk, better-auth,
drizzle, effect, kubb, tailwind) earn the artifact-level checks; build tooling counts as
runtime-facing here, because its behaviour changes are what turn the board red.

Also in the same diff:

- **New `overrides` entries.** `pnpm audit --fix` is not compatibility-aware and will happily
  force a transitive dependency across a major boundary — or point at a version that was never
  published (see `ERR_PNPM_NO_MATCHING_VERSION`).
- `mise.toml` / `mise.lock`: check node did not cross a major the code is not ready for, and that
  `mise.lock` still carries all platforms (CI needs `linux-x64`).
- **Workflow diffs are not automatically benign.** `pinact` re-pins by SHA, so a whole major looks
  identical to a patch — the trailing `# vX.Y.Z` comment is the only tell. Read it on every Action
  bump, and for a major, diff the action's own `inputs:` against the workflow's `with:` keys:
  GitHub silently ignores unknown inputs, so a rename disables a step with no error anywhere. See
  the `changesets/action` entry in `failure-modes.md`.
- **A tool major can invalidate committed config** rather than code — exercise any tool that reads
  a config file in the repo (`pnpm changeset status --since=main`), and bump `$schema` URLs to
  match the new major.

### 5. Local CI parity

```bash
pnpm install --frozen-lockfile
pnpm check                                  # biome + knip + is-tree-shakable — the required gate
pnpm test
pnpm turbo run build --filter="./packages/*" --force
```

`pnpm check` and `pnpm test` are exactly what CI gates on. The forced build is not in CI but
catches real breakage cheaply.

`ai-gateway-proxy`'s integration tests are gated on `AI_GATEWAY_API_KEY`
(`describe.skipIf(!hasApiKey)`). **The repo has no such secret, so in CI they silently skip** —
the log shows `13 skipped`, and the job still goes green. Locally they run only if you have the
key in your environment, and fail with `GatewayAuthenticationError` if it is not a valid one.

This matters most exactly when it matters most: an `ai` / `@ai-sdk/*` major has **no** automated
runtime coverage in this repo. Treat a green CI on such a bump as "it compiles", nothing more, and
say so in the review comment.

**Not adding the secret to CI is a deliberate decision** (2026-07) — do not propose it again. The
gateway costs money per call and the key would be exposed to every workflow run. So for an
`ai`/`@ai-sdk` major, get the evidence another way:

- exercise a generation request against a deploy preview, or run the integration tests locally
  with a key in your environment (`AI_GATEWAY_API_KEY=… pnpm --filter ai-gateway-proxy test`)
- if neither happened, **say so plainly in the review comment** rather than implying the bump was
  verified. An unverified AI SDK major is an acceptable risk the maintainer can choose to take; an
  unverified one described as tested is not.

The bot adds no changeset. There is no changeset gate in CI, so only add one if a bump genuinely
changes published behaviour of a package in `packages/*`.

### 6. Verify what CI does not

**Do not skip.** Follow **[references/verification.md](references/verification.md)** for the
VS Code extension packaging constraints (the most fragile surface here), the publish path, and
which preview surfaces to exercise for which dependency families.

### 7. Finish

Iterate until `Check` is green and the surfaces in step 6 hold, then write the review **into the
PR description**, not a comment:

```bash
gh pr edit <num> --body-file <file>
```

The bot opens the PR with a one-line placeholder body ("This is an autogenerated PR to update the
dependencies!"), so there is nothing worth preserving — replace it. Cover what was held back and
why, what broke and the fix, and what you verified — and explicitly what you did **not**. Being
clear about the gap matters more than the list of greens: the next reviewer needs to know whether
the previews were exercised or merely deployed. Write it for them, not as a play-by-play.

**The description is a living summary; comments are an append-only log.** A stack of comments
narrating how the branch got here ages badly — half of it is false by merge time. So re-edit the
description when facts change rather than appending a correction, and reserve comments for things
that are genuinely a moment in time (a question for a specific person, a heads-up that needs to
interrupt someone). Leave the bots' own comments alone.

Then fold anything new into `references/failure-modes.md` — **and prune**, per non-negotiable 8.
