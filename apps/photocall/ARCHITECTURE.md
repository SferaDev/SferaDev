# Wedding Photo Booth Kiosk - Architecture

## Requirements

### Functional Requirements

**Guest Kiosk Flow:**
- FR1: Attract screen with idle slideshow of recent photos and "Tap to start" CTA
- FR2: Template selection screen (up to 6 wedding frames)
- FR3: Camera capture with front/back toggle, 3-2-1 countdown, preview, retake/accept
- FR4: Personalization with optional caption (max 40 chars) and mirror toggle
- FR5: Canvas compositing of photo + overlay frame + caption
- FR6: Upload rendered image to S3 (via presigned URL)
- FR7: Generate unique share token and public URL
- FR8: Result screen with QR code, human-readable code (e.g., ABCD-1234), "Take another"

**Admin Panel:**
- FR9: PIN-protected admin access
- FR10: Photo gallery with pagination, view/download individual photos
- FR11: Bulk export as ZIP
- FR12: Template manager (upload PNG overlays, set metadata, enable/disable)
- FR13: Settings management (PIN, slideshow, timeout, camera, language, retention)

**Public Share:**
- FR14: /share/[token] page shows photo with download button
- FR15: Optional expiration for share links

### Non-Functional Requirements

- NFR1: Works reliably on iPad Safari and Android Chrome
- NFR2: Fast photo capture and upload (<5s total)
- NFR3: Graceful handling of network interruptions
- NFR4: Image output capped at 2048px long edge for upload speed
- NFR5: Support offline mode for attract screen (cached images)

### Accessibility

- A11Y1: High contrast UI with large touch targets (min 48x48px)
- A11Y2: Clear visual feedback for all interactions
- A11Y3: Screen reader support for essential flows
- A11Y4: Multi-language support (EN/ES/CAT)

### Security & Privacy

- SEC1: Admin PIN stored as hashed value (not plaintext)
- SEC2: Share tokens are cryptographically random, 16+ chars
- SEC3: Rate limiting on public endpoints
- SEC4: No facial recognition or biometric processing
- SEC5: Configurable retention policy with manual/automatic deletion
- SEC6: Consent acknowledgment in kiosk flow

### Kiosk Operational Requirements

- KIO1: Idle timeout returns to attract screen
- KIO2: Auto-cleanup of incomplete sessions
- KIO3: Error recovery with "Try again" options
- KIO4: Works in guided access (iPad) and screen pinning (Android)

### Observability

- OBS1: Error logging to console (extensible to external service)
- OBS2: Session metrics (photos taken, completion rate)
- OBS3: Upload success/failure tracking

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP (Vercel)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │  Marketing  │   │    Kiosk    │   │    Admin    │   │    Share    │ │
│  │   Landing   │   │    Flow     │   │    Panel    │   │    Page     │ │
│  │     /       │   │   /kiosk    │   │   /admin    │   │ /share/[id] │ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘ │
│         │                │                 │                  │         │
│         └────────────────┴─────────────────┴──────────────────┘         │
│                                    │                                    │
│                         ┌─────────────────────┐                         │
│                         │   SWR + Server      │                         │
│                         │   Actions client    │                         │
│                         └─────────────────────┘                         │
│                                    │                                    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SCHEMA (Postgres + Drizzle)                   │   │
│  │  organizations, organization_members, invitations, events,       │   │
│  │  templates, sessions, photos, user_profiles, billing,            │   │
│  │  + better-auth: users, sessions, accounts, verifications         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SERVER ACTIONS                                │   │
│  │  - organizations, events, templates                              │   │
│  │  - sessions, photos                                              │   │
│  │  - stripe (checkout, portal, billing summary, webhooks)          │   │
│  │  - email (Resend invitations)                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FILE STORAGE (S3)                             │   │
│  │  - Photo uploads (rendered composites) — presigned PUT/GET       │   │
│  │  - Template overlay PNGs                                         │   │
│  │  - Org / event logos                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SCHEDULED JOBS (Vercel Cron)                  │   │
│  │  - /api/cron/cleanup — photo retention purge                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Folder Structure (current)

```
apps/photocall/
├── app/
│   ├── layout.tsx                   # Root layout (html/body, theme, toaster, metadata)
│   ├── page.tsx                     # Redirects "/" to /<defaultLocale>
│   ├── error.tsx                    # Root error boundary
│   ├── global-error.tsx             # Root-of-root global error
│   ├── not-found.tsx                # 404
│   ├── loading.tsx                  # Root suspense fallback
│   ├── icon.tsx                     # Favicon (next/og)
│   ├── apple-icon.tsx               # Apple touch icon (next/og)
│   ├── opengraph-image.tsx          # OG image (next/og)
│   ├── twitter-image.tsx            # Twitter card
│   ├── manifest.ts                  # Web manifest
│   ├── robots.ts                    # robots.txt
│   ├── sitemap.ts                   # sitemap.xml
│   ├── providers.tsx                # SWR provider
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx               # Locale-aware metadata + next-intl provider
│   │   └── page.tsx                 # Localized marketing landing page
│   ├── (auth)/
│   │   ├── layout.tsx               # Auth split-screen layout
│   │   └── sign-in/page.tsx         # Sign-in (delegated to better-auth)
│   ├── dashboard/
│   │   ├── page.tsx                 # Org list
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── [orgSlug]/
│   │       ├── page.tsx             # Events list
│   │       ├── team/                # Team management
│   │       ├── billing/             # Billing (UI owned by platform agent)
│   │       └── [eventSlug]/
│   │           ├── page.tsx         # Event dashboard (gallery, templates)
│   │           ├── settings/        # Event settings (incl. kiosk PIN)
│   │           └── templates/       # Template manager
│   ├── kiosk/
│   │   └── [orgSlug]/[eventSlug]/
│   │       ├── page.tsx             # Attract screen w/ slideshow + admin PIN
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       ├── consent/             # Photo consent
│   │       ├── select/              # Template select
│   │       ├── capture/             # Camera capture + countdown
│   │       ├── personalize/         # Caption / mirror
│   │       └── result/              # QR + share + download + print
│   ├── share/[token]/               # Public share page
│   ├── p/[code]/page.tsx            # Short human-code redirect to /share/[token]
│   ├── invite/[token]/              # Accept org invitation
│   └── api/
│       ├── auth/[...all]/           # better-auth handler
│       ├── stripe/webhook/          # Stripe webhook (idempotent)
│       └── cron/cleanup/            # Retention purge (CRON_SECRET protected)
├── components/
│   ├── ui/                          # shadcn/ui primitives (button, dialog, dropdown, skeleton, …)
│   ├── auth/                        # Sign-in form (better-auth bindings)
│   ├── locale-switcher.tsx
│   ├── structured-data.tsx          # JSON-LD for SEO
│   └── theme-provider.tsx
├── actions/                         # Server actions ("use server")
│   ├── organizations.ts             # Orgs, members, invitations, usage
│   ├── events.ts                    # Events CRUD, PIN, duplicate
│   ├── templates.ts                 # Template CRUD + reorder
│   ├── sessions.ts                  # Kiosk session lifecycle
│   ├── photos.ts                    # Photo CRUD + share lookups
│   ├── stripe.ts                    # Checkout, portal, billing summary
│   └── email.ts                     # Invitation emails
├── lib/
│   ├── auth.ts, auth-client.ts, auth-helpers.ts   # better-auth wiring
│   ├── db/{index.ts,schema.ts}      # Postgres pool + Drizzle schema
│   ├── storage.ts                   # S3 presigned URL helpers
│   ├── canvas-utils.ts              # Compositing helpers (used by kiosk)
│   ├── plans.ts                     # Plan + pricing constants (catalogued in stripe action)
│   ├── qr.ts                        # QR code helpers
│   └── utils.ts
├── hooks/
│   ├── use-admin-auth.ts            # 30-min kiosk admin session via localStorage
│   ├── use-camera.ts                # getUserMedia wrapper
│   ├── use-idle-timeout.ts          # Kiosk idle redirect
│   └── use-toast.ts                 # shadcn toast
├── i18n/
│   ├── config.ts                    # 46 locales, RTL list, defaultLocale
│   ├── request.ts                   # next-intl request config
│   └── messages/<locale>.json       # Translations
├── tests/                           # vitest unit tests (auth helpers, canvas, utils)
├── public/sw.js                     # Offline image cache service worker
├── middleware.ts                    # next-intl + auth proxy
├── next.config.ts
├── vercel.json                      # Cron schedule
└── package.json
```

## Implementation Plan

1. **Phase 1: Backend Setup**
   - Provision Postgres (via Vercel Marketplace, e.g. Neon)
   - Define Drizzle schema (sessions, photos, templates, settings, organizations, billing)
   - Implement server actions for CRUD
   - Wire S3 bucket and presigned URL helpers in `lib/storage.ts`

2. **Phase 2: Marketing Landing**
   - Hero section with product overview
   - Features section
   - CTA to kiosk and admin

3. **Phase 3: Admin Panel**
   - PIN authentication
   - Settings management
   - Template CRUD
   - Photo gallery with pagination
   - ZIP export

4. **Phase 4: Kiosk Flow**
   - Attract screen with slideshow
   - Template selection
   - Camera capture with countdown
   - Photo preview and personalization
   - Canvas compositing
   - Upload and result display

5. **Phase 5: Share Page**
   - Public share route
   - QR code generation
   - Download functionality

6. **Phase 6: Polish**
   - Multi-language support
   - Error handling
   - Performance optimization
   - Testing
