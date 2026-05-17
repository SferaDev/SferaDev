# @sferadev/platform

Unified identity and billing service for sferadev products.

The platform owns:

- **Identity** — single [better-auth](https://www.better-auth.com/) instance with
  social providers, sessions, organizations, members, and invitations.
- **Billing** — Stripe customers, subscriptions, hosted Checkout, Customer
  Portal, metered usage, and webhook handling.
- **Entitlements** — products register plans and features; the engine resolves
  the active plan for an account and answers `can(feature)` / `getQuota(feature)`
  with an in-process LRU cache (60s TTL, webhook-driven invalidation).

Products consume the platform exclusively through
[`@sferadev/platform-sdk`](../../packages/platform-sdk) — they never import
`better-auth` or `stripe` directly.

## Architecture

```
              ┌────────────────────────────────┐
              │   @sferadev/platform (Hono)    │
              │                                │
   ┌─────┐    │  /auth/*  (better-auth)        │
   │ App ├────►  /api/billing/*                │────► Stripe
   └─────┘    │  /api/entitlements/*           │
   (uses SDK) │  /api/webhooks/stripe          │
              └──────────────┬─────────────────┘
                             │ Drizzle
                             ▼
                          Postgres
```

**Account = user or organization.** The platform treats either an `users.id`
or an `organizations.id` as a valid `accountId`. Billing service first checks
`organizations.stripeCustomerId`, then falls back to `users.stripeCustomerId`.
For SaaS products like photocall the org is the billing account.

**Auth via reverse proxy.** Product apps proxy `/api/auth/*` to the platform's
`/auth/*`. Cookies are set on the product's own domain (first-party), so the
browser session works without cross-origin trickery.

## Running locally

```bash
# 1. Install Postgres and create a database
createdb platform

# 2. Copy env and fill in values
cp apps/platform/.env.example apps/platform/.env

# 3. Apply migrations (creates better-auth tables + platform tables)
pnpm --filter @sferadev/platform db:migrate

# 4. Start the dev server
pnpm --filter @sferadev/platform dev
# → listening on http://localhost:3100
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | yes | 32+ char random secret for session signing |
| `BETTER_AUTH_URL` | yes | Public URL of the platform (e.g. `http://localhost:3100`) |
| `STRIPE_SECRET_KEY` | yes | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | yes | `whsec_...` from Stripe Dashboard webhook configuration |
| `PLATFORM_SERVICE_TOKEN` | yes | Random secret shared with products for server-to-server calls |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Enables Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | optional | Enables GitHub OAuth |
| `PORT` | optional | HTTP port (default `3100`) |

## Registering a product

A product is identified by an id (e.g. `photocall`) and has one or more plans.
Plans have features; features can be binary (enabled/disabled) or quota-based
(`limitValue` + `limitWindow`). All admin endpoints require the
`PLATFORM_SERVICE_TOKEN` as a bearer.

```bash
# 1. Register the product
curl -X POST http://localhost:3100/api/products/admin/products \
  -H "Authorization: Bearer $PLATFORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "photocall",
    "name": "Photocall",
    "slug": "photocall"
  }'

# 2. Register plans (one must have isDefault=true to serve as the free tier)
curl -X POST http://localhost:3100/api/products/admin/plans \
  -H "Authorization: Bearer $PLATFORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "photocall_free",
    "productId": "photocall",
    "name": "Free",
    "slug": "free",
    "isDefault": true
  }'

curl -X POST http://localhost:3100/api/products/admin/plans \
  -H "Authorization: Bearer $PLATFORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "photocall_pro",
    "productId": "photocall",
    "name": "Pro",
    "slug": "pro",
    "stripePriceId": "price_..."
  }'

# 3. Define plan features
curl -X POST http://localhost:3100/api/products/admin/plan-features \
  -H "Authorization: Bearer $PLATFORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "id": "f_free_create_event",  "planId": "photocall_free", "feature": "create_event",   "enabled": true,  "limitValue": 1 },
    { "id": "f_free_capture_photo", "planId": "photocall_free", "feature": "capture_photo",  "enabled": true,  "limitValue": 10 },
    { "id": "f_free_branding",      "planId": "photocall_free", "feature": "custom_branding","enabled": false, "limitValue": null },
    { "id": "f_pro_create_event",   "planId": "photocall_pro",  "feature": "create_event",   "enabled": true,  "limitValue": null },
    { "id": "f_pro_capture_photo",  "planId": "photocall_pro",  "feature": "capture_photo",  "enabled": true,  "limitValue": null },
    { "id": "f_pro_branding",       "planId": "photocall_pro",  "feature": "custom_branding","enabled": true,  "limitValue": null }
  ]'

# 4. (Optional) Register a metered dimension
curl -X POST http://localhost:3100/api/products/admin/meters \
  -H "Authorization: Bearer $PLATFORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "m_photos_captured",
    "productId": "photocall",
    "name": "photos_captured",
    "stripeMeterId": "mtr_...",
    "stripeMeterEventName": "photos_captured"
  }'
```

## Stripe webhook

Point Stripe at `POST /api/webhooks/stripe` and subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

The handler resolves the account from `subscription.metadata.platformAccountId`
when present, then falls back to looking up the org/user by
`stripeCustomerId`.

## Deploying

The service is a plain Node HTTP server (`@hono/node-server`). Build with
`pnpm --filter @sferadev/platform build` and run `node dist/index.js` with the
above environment variables. It works behind any HTTP proxy/load balancer that
preserves cookies and the `stripe-signature` header.
