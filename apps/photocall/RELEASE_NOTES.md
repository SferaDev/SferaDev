# Photocall v1.0 release notes

Companion document to the v1.0 PR. Lists meaningful changes done in this branch and known follow-ups (including items handed off to the parallel "platform auth/billing" agent).

## Done in this branch

### Routing, layouts, error/loading boundaries
- Fixed nested `<html>` issue in `app/[locale]/layout.tsx` — the locale layout no longer renders its own `<html>`/`<body>`, restoring valid markup for both localized and non-localized routes (dashboard, kiosk, share).
- Added `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx`.
- Added segment-scoped `loading.tsx` + `error.tsx` for `app/dashboard`, `app/kiosk/[orgSlug]/[eventSlug]`, `app/share/[token]`, `app/invite/[token]`.
- Loading states use skeletons (new `components/ui/skeleton.tsx`) instead of bare spinners.

### SEO / metadata / branding
- Added `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/twitter-image.tsx` (Satori-based, no static assets needed).
- Added PWA manifest via `app/manifest.ts`.
- Root `layout.tsx` now exposes `metadataBase`, OG, Twitter card defaults, and a `template` title.
- Locale layout adds `og:images`/`twitter:images` and `alternates.languages` for all 46 locales.

### Server-action cleanup (unused exports)
Removed unused, redundant server actions to keep the surface tight: `getEvent`, `getOrganization`, `getPhoto`, `getPhotoCount`, `getSessionStats`, `listSessions`, `listRecentPhotos`, `getTemplate`, `generateEventUploadUrl`, `generateOrgUploadUrl`. Their behavior is covered by `*BySlug` siblings or by event/template dashboards.

Wired previously-orphaned actions:
- `duplicateEvent` — invoked from the new event-row dropdown in the org dashboard.
- `updateMemberRole` — invoked from a per-member role `Select` in the team page (owners only).
- `validateKioskPin` — exposed via a long-press admin escape on the kiosk attract screen, gated by the existing `useAdminAuth` 30-minute session hook.
- `getPhotoByHumanCode` — backs a new short-link route `/p/[code]` that redirects to `/share/[token]`.

### Kiosk
- Attract screen gains a long-press admin escape (top-left, 1.5s) with PIN dialog.
- Service worker registration no longer logs noise on failures.
- Error boundary in kiosk segment offers a clean "Start over" path.

### Dashboard polish
- Org dashboard event cards now use a dropdown menu (Open dashboard / Settings / Duplicate / Open kiosk) instead of a stray "more" button that pointed at settings.
- Team page: inline email validation, toast feedback for invite/cancel/remove/role-change, owner-only role-change `Select`.

### Documentation
- New `README.md` covering features, env, local dev, Vercel deployment, Stripe, kiosk operation, testing.
- Updated `ARCHITECTURE.md` folder structure to match the current code.

### Tooling cleanliness
- `pnpm tsc`, `pnpm test`, `pnpm build`, `pnpm knip`, `pnpm biome check .` all clean (1 leftover warning in `app/api/stripe/webhook/route.ts` is owned by the platform agent — see below).

## Handed off to the platform (auth/billing) agent

These items either touch locked files or depend on the in-flight auth/billing rewrite. They are not blockers to ship Photocall once the platform branch lands.

- **Biome warning** in `app/api/stripe/webhook/route.ts:5` — unused `INCLUDED_PHOTOS_PER_EVENT` import. Trivial removal but the file is locked.
- **Unused billing actions**: `deleteOrganization`, `updateOrganization`, `getSubscription`, `payOverages`. Likely to be wired by the new billing UI; leaving in place.
- **Sign-in metadata** — `app/(auth)/sign-in/page.tsx` is a client component with no title/description. Once the auth agent finishes the rewrite, add a `generateMetadata` to its enclosing server segment.
- **Locale routing for dashboard/kiosk/share/invite/sign-in** — currently excluded from the next-intl middleware matcher for stability. Re-enabling will require coordination with the auth proxy in `middleware.ts`.
- **i18n on dashboard surfaces** — every server-rendered, user-facing string in `app/dashboard` is still hard-coded English. The kiosk attract / share page are also English. Adding `useTranslations` calls here is straightforward but was deferred to avoid stepping on the auth UI rework.
- **Full Spanish/Catalan parity** — `i18n/messages/{es,ca}.json` already match the English keyset for the landing page; remaining locales (ar/bg/bn/…) are landing-page stubs that fall back to English.

## Risks / known limitations

- Photo capture / upload uses presigned URLs to S3 directly. Browsers blocking 3rd-party storage cookies should not be affected; if you front the bucket with a custom CDN, set `S3_PUBLIC_URL` to its origin.
- The cron retention purge processes 50 photos per run (`BATCH_LIMIT`). For very large fleets, lower the cron interval or raise the limit.
- The short link `/p/[code]` reveals whether a code is valid (404 vs redirect). Codes are alphanumeric and short enough that they're guessable in theory — assume `share_token` (16 random chars) is the real secret.
