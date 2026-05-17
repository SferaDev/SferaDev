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

## Folder Structure

```
apps/photocall/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 # Landing page
│   │   └── layout.tsx
│   ├── kiosk/
│   │   ├── page.tsx                 # Kiosk entry/attract screen
│   │   ├── select/page.tsx          # Template selection
│   │   ├── capture/page.tsx         # Camera capture
│   │   ├── personalize/page.tsx     # Caption/mirror options
│   │   ├── result/page.tsx          # QR code result
│   │   └── layout.tsx               # Kiosk layout (fullscreen)
│   ├── admin/
│   │   ├── page.tsx                 # Admin login
│   │   ├── dashboard/page.tsx       # Main dashboard
│   │   ├── gallery/page.tsx         # Photo gallery
│   │   ├── templates/page.tsx       # Template manager
│   │   ├── settings/page.tsx        # Settings
│   │   └── layout.tsx               # Admin layout with nav
│   ├── share/
│   │   └── [token]/page.tsx         # Public share page
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx                # Client providers (SWR, theme)
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── kiosk/
│   │   ├── attract-screen.tsx
│   │   ├── template-grid.tsx
│   │   ├── camera-capture.tsx
│   │   ├── countdown-overlay.tsx
│   │   ├── photo-preview.tsx
│   │   ├── caption-input.tsx
│   │   └── result-display.tsx
│   ├── admin/
│   │   ├── photo-gallery.tsx
│   │   ├── template-manager.tsx
│   │   ├── settings-form.tsx
│   │   └── export-button.tsx
│   └── shared/
│       ├── qr-code.tsx
│       └── loading-spinner.tsx
├── actions/                         # Next.js server actions
│   ├── organizations.ts
│   ├── events.ts
│   ├── templates.ts
│   ├── sessions.ts
│   ├── photos.ts
│   ├── stripe.ts
│   └── email.ts
├── lib/db/
│   ├── index.ts                     # Postgres + Drizzle client
│   └── schema.ts                    # Drizzle schema
├── hooks/
│   ├── use-camera.ts
│   ├── use-compositing.ts
│   ├── use-admin-auth.ts
│   └── use-idle-timeout.ts
├── lib/
│   ├── utils.ts
│   ├── i18n.ts                      # Internationalization
│   ├── constants.ts
│   └── canvas-utils.ts
├── public/
│   └── default-templates/           # Default overlay images
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
