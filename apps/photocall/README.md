# Photocall

A modern photo-booth kiosk SaaS for weddings, parties, corporate events, and celebrations. Built with Next.js 16 (App Router), Postgres + Drizzle, S3-compatible storage, Stripe billing, and better-auth.

## Highlights

- Touch-friendly kiosk flow: consent → template → camera + countdown → personalize → QR share + print
- Offline-first kiosk: once opened, the app shell, event data, and slideshow are
  cached (service worker + persisted SWR cache) so the booth keeps running
  through network drops. Photos captured while offline are held in an IndexedDB
  outbox and uploaded automatically when connectivity returns
- Multi-org dashboard with team management, role-based access, billing, and event analytics
- Template manager with overlay positioning, safe-area, caption styling
- Branded sharing pages with download / print / human-readable short code (`/p/ABCD-1234`)
- Internationalization (46 locales scaffolded, full coverage for English / Spanish / Catalan)
- Stripe Checkout for one-off event credits + photo overages, customer portal for invoices
- Idempotent webhook + cron retention purge

## Stack

| Layer | Library |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | better-auth (email + OAuth) |
| Data | Postgres via Drizzle ORM |
| Storage | S3 (presigned URLs via `@aws-sdk/client-s3`) |
| Payments | Stripe (Checkout, Billing Portal, Webhooks) |
| Email | better-auth invites (delegate transport via Resend or SMTP) |
| UI | shadcn/ui primitives + Tailwind CSS v4 + Geist |
| i18n | next-intl |
| Client state | SWR |
| Testing | Vitest + Testing Library |

## Local development

```sh
# from the repo root
pnpm install

# from apps/photocall
cp .env.example .env.local           # fill values; see "Environment" below
pnpm db:push                          # apply Drizzle schema to your Postgres
pnpm dev                              # http://localhost:3000
```

Photocall delegates auth/billing/entitlements to the **platform** service, so it
must be running and seeded for the dashboard and kiosk to work. After the
platform's database is migrated, register the Photocall product and its default
free plan (without a default plan the platform denies `create_event` and the
other quota-gated actions):

```sh
psql "$PLATFORM_DATABASE_URL" -f ../platform/scripts/seed-photocall.sql
```

Useful scripts:

```sh
pnpm dev          # next dev --turbopack
pnpm build        # next build
pnpm test         # vitest run
pnpm tsc          # typecheck (no emit)
pnpm db:generate  # drizzle migration files
pnpm db:migrate   # run pending migrations
pnpm db:push      # sync schema (dev only)
pnpm db:studio    # open Drizzle Studio
```

## Environment

All values are required for production.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | better-auth signing secret |
| `BETTER_AUTH_URL` | Public origin (e.g. `https://photocall.app`) |
| `NEXT_PUBLIC_SITE_URL` | Used for absolute URLs in metadata, OG, share links |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| `S3_BUCKET` | Bucket name for uploads |
| `S3_PUBLIC_URL` | Public/CDN base URL serving the bucket |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CRON_SECRET` | Auth header for `/api/cron/cleanup` |

## Deployment (Vercel)

1. **Create the project** — link this app to a Vercel project (`vercel link` from `apps/photocall`).
2. **Provision Postgres** — install a Postgres integration from the Vercel Marketplace (Neon, Supabase, Xata). Copy `DATABASE_URL` to env.
3. **Configure S3 storage** — create a bucket (S3, R2, Tigris, …). Set `AWS_*`, `S3_BUCKET`, `S3_PUBLIC_URL`. CORS must allow PUT/GET from your app origin.
4. **Configure Stripe** — set `STRIPE_SECRET_KEY` and create a webhook for `/api/stripe/webhook` with `STRIPE_WEBHOOK_SECRET`. Forward `checkout.session.completed`, `customer.subscription.*`, `invoice.*` events.
5. **Set `CRON_SECRET`** — `vercel.json` schedules `/api/cron/cleanup` daily at 03:00 UTC. Without `CRON_SECRET`, the endpoint returns 401.
6. **Push** — Vercel will run `next build` and pick up the cron schedule + middleware automatically.

### Database migrations

For first deploy: `pnpm db:push`. For incremental schema changes, prefer:

```sh
pnpm db:generate     # writes a new migration to drizzle/
pnpm db:migrate      # apply pending migrations (run in CI or release script)
```

## Stripe setup

1. Create a Stripe account and grab `STRIPE_SECRET_KEY` (test mode is fine for staging).
2. Register a webhook endpoint pointing at `https://<your-domain>/api/stripe/webhook`. Set its secret as `STRIPE_WEBHOOK_SECRET`.
3. The app provisions products dynamically through Checkout `price_data`, so no manual product setup is required. Pricing constants live in `lib/plans.ts`.

## Kiosk operation

- Open `/kiosk/<org-slug>/<event-slug>` on the kiosk device.
- Long-press the top-left corner (1.5s) and enter the event PIN to unlock admin controls without exiting the kiosk.
- Set/rotate the PIN under **Event settings → Security**.
- Use `Guided Access` (iOS) or `Pinned App` (Android) to lock the device to the kiosk URL.
- The service worker (`/sw.js`) caches recent slideshow images for resilience to spotty Wi-Fi.

## Testing

```sh
pnpm test          # unit tests (auth helpers, canvas utils)
pnpm test:watch    # watch mode
```

Key flows worth smoke-testing before each release:

- Sign-up → create organization → invite a teammate → accept invite
- Create event → set kiosk PIN → activate event → launch kiosk
- Kiosk: consent → select template → capture → personalize → see QR + share link
- Open `/share/<token>` → download → print
- Open `/p/<human-code>` → redirects to the share page
- Cron: `curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/cleanup`

## Internationalization

`i18n/messages/*.json` ship with the app. English, Spanish, and Catalan are fully translated; the remaining locales fall back to English keys. Add more strings to `en.json` first, then mirror in other locales. The locale switcher is rendered in the marketing landing layout.

## License

MIT
