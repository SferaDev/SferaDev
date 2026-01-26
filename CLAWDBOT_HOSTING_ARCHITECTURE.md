# Clawdbot Hosting Platform SaaS - Architecture Proposal

## Executive Summary

This document proposes an architecture for a **managed hosting platform for Clawdbot** - a self-hosted AI assistant that connects to 13+ messaging platforms (WhatsApp, Telegram, Discord, Slack, etc.). The platform will enable users to deploy, configure, and manage their own Clawdbot instances without dealing with infrastructure complexity.

### Key Challenges Identified

| Challenge | Clawdbot Requirement | Implication |
|-----------|---------------------|-------------|
| **Long-running process** | WebSocket gateway must stay alive 24/7 | Cannot use purely serverless |
| **Persistent state** | `~/.clawdbot/` config, credentials, session data | Need durable volumes |
| **Memory requirements** | 2GB+ RAM recommended | Cannot use lightweight functions |
| **Network access** | Port 18789 + messaging platform webhooks | Need public endpoints |
| **Sensitive credentials** | OAuth tokens, API keys, messaging credentials | Need secure secrets management |

### Why Pure Vercel Won't Work

While you have a preference for Vercel products, the research reveals critical limitations:

| Vercel Product | Limitation for Clawdbot |
|----------------|------------------------|
| **Vercel Functions** | Max 800s execution, no persistent connections |
| **Vercel Sandbox** | Ephemeral (max 5 hours), single region (iad1), no persistent storage |
| **Vercel Edge** | Limited runtime, no Node.js 22 features |

**Verdict**: Vercel alone cannot host Clawdbot instances. However, Vercel excels at building the **control plane** while we use specialized infrastructure for the **data plane** (actual Clawdbot instances).

---

## Proposed Architecture: Hybrid Approach

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLAWDBOT HOSTING PLATFORM                                  │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                    CONTROL PLANE (Vercel)                                       │ │
│  │                                                                                 │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐   │ │
│  │  │  Next.js App    │  │ Vercel Workflows │  │ API Routes                  │   │ │
│  │  │  (Dashboard)    │  │ (Orchestration)  │  │ (Instance Management)       │   │ │
│  │  │                 │  │                  │  │                             │   │ │
│  │  │ • User auth     │  │ • Provisioning   │  │ • POST /api/instances       │   │ │
│  │  │ • Instance list │  │ • Health checks  │  │ • GET /api/instances/:id    │   │ │
│  │  │ • Config editor │  │ • Auto-scaling   │  │ • PUT /api/instances/:id    │   │ │
│  │  │ • Billing UI    │  │ • Backup jobs    │  │ • DELETE /api/instances/:id │   │ │
│  │  │ • Logs viewer   │  │ • Notifications  │  │ • POST /api/config          │   │ │
│  │  │ • Usage/Overage │  │ • Usage tracking │  │ • GET /api/usage            │   │ │
│  │  └─────────────────┘  └──────────────────┘  └─────────────────────────────┘   │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    PostgreSQL (Generic / Neon / Supabase)               │   │ │
│  │  │  • User accounts    • Instance metadata    • Usage records & overages   │   │ │
│  │  │  • Billing records  • Session data         • Plan limits & quotas       │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                         │                                            │
│                                         │ Fly.io Machines API                        │
│                                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                     DATA PLANE (Fly.io Machines)                               │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                         Global Edge (Anycast)                           │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │         │                      │                      │                         │ │
│  │         ▼                      ▼                      ▼                         │ │
│  │  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐                 │ │
│  │  │  Region:    │        │  Region:    │        │  Region:    │                 │ │
│  │  │  iad (US)   │        │  ams (EU)   │        │  sin (Asia) │                 │ │
│  │  │             │        │             │        │             │                 │ │
│  │  │ ┌─────────┐ │        │ ┌─────────┐ │        │ ┌─────────┐ │                 │ │
│  │  │ │Instance │ │        │ │Instance │ │        │ │Instance │ │                 │ │
│  │  │ │ user-1  │ │        │ │ user-3  │ │        │ │ user-5  │ │                 │ │
│  │  │ │(MicroVM)│ │        │ │(MicroVM)│ │        │ │(MicroVM)│ │                 │ │
│  │  │ ├─────────┤ │        │ ├─────────┤ │        │ ├─────────┤ │                 │ │
│  │  │ │Volume   │ │        │ │Volume   │ │        │ │Volume   │ │                 │ │
│  │  │ │(1-5GB)  │ │        │ │(1-5GB)  │ │        │ │(1-5GB)  │ │                 │ │
│  │  │ └─────────┘ │        │ └─────────┘ │        │ └─────────┘ │                 │ │
│  │  │ ┌─────────┐ │        │ ┌─────────┐ │        │ ┌─────────┐ │                 │ │
│  │  │ │Instance │ │        │ │Instance │ │        │ │Instance │ │                 │ │
│  │  │ │ user-2  │ │        │ │ user-4  │ │        │ │ user-6  │ │                 │ │
│  │  │ └─────────┘ │        │ └─────────┘ │        │ └─────────┘ │                 │ │
│  │  └─────────────┘        └─────────────┘        └─────────────┘                 │ │
│  │                                                                                 │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                          SECRETS & CONFIG                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Doppler / Infisical / Vault                          │   │ │
│  │  │  Per-tenant secrets:                                                    │   │ │
│  │  │  • ANTHROPIC_API_KEY        • CLAWDBOT_GATEWAY_TOKEN                   │   │ │
│  │  │  • TELEGRAM_BOT_TOKEN       • DISCORD_TOKEN                            │   │ │
│  │  │  • WHATSAPP_CREDENTIALS     • Custom environment variables             │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Deep Dive

### 1. Control Plane (Vercel)

The control plane handles all user-facing functionality and orchestration logic.

#### 1.1 Database: Generic PostgreSQL with Prisma

We use a generic PostgreSQL database (can be hosted on Neon, Supabase, Railway, or self-hosted) with Prisma ORM for type-safe queries.

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Better Auth tables (auto-generated via CLI)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]
  instances     Instance[]
  usageRecords  UsageRecord[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String  @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Application tables
model Instance {
  id          String   @id @default(cuid())
  userId      String
  machineId   String   @unique
  volumeId    String?
  region      String
  hostname    String   @unique
  plan        Plan     @default(STARTER)
  status      InstanceStatus @default(PROVISIONING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  usageRecords UsageRecord[]

  @@index([userId])
}

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String
  instanceId  String
  periodStart DateTime
  periodEnd   DateTime

  // Metered usage
  uptimeMinutes    Int @default(0)
  bandwidthMB      Int @default(0)
  storageGB        Float @default(0)
  messagesProcessed Int @default(0)

  // Computed costs
  baseCost         Float @default(0)
  overageCost      Float @default(0)
  totalCost        Float @default(0)

  createdAt   DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  instance Instance @relation(fields: [instanceId], references: [id])

  @@unique([instanceId, periodStart])
  @@index([userId, periodStart])
}

enum Plan {
  STARTER
  PRO
}

enum InstanceStatus {
  PROVISIONING
  RUNNING
  STOPPED
  FAILED
  DELETED
}
```

#### 1.2 Authentication: Better Auth

Better Auth is a framework-agnostic authentication library that gives us full control over the auth flow while supporting all major providers.

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

```typescript
// middleware.ts
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/sign-in', '/sign-up', '/api/auth', '/api/webhooks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verify session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### 1.3 Next.js Dashboard Application

```typescript
// app/dashboard/instances/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { InstanceCard } from '@/components/InstanceCard';

export default async function InstancesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const instances = await db.instance.findMany({
    where: { userId: session.user.id },
    include: {
      usageRecords: {
        take: 1,
        orderBy: { periodStart: 'desc' },
      },
    },
  });

  return (
    <div className="grid gap-4">
      {instances.map(instance => (
        <InstanceCard
          key={instance.id}
          instance={instance}
        />
      ))}
    </div>
  );
}
```

**Features:**
- **Authentication**: Better Auth with email/password + OAuth providers
- **Instance Management**: Create, start, stop, delete instances
- **Configuration Editor**: Visual editor for `clawdbot.json`
- **Logs Viewer**: Real-time log streaming from instances
- **Billing & Overage**: Stripe integration with usage-based overage billing
- **Messaging Setup Wizards**: Guided setup for WhatsApp, Telegram, etc.

#### 1.4 Vercel Workflows (Orchestration)

Workflows provide durable execution for long-running operations. The `"use workflow"` directive makes an async function durable, and `"use step"` marks individual retriable steps.

```typescript
// workflows/provision-instance.ts
import { serve } from '@vercel/workflow';
import { flyClient } from '@/lib/fly';
import { db } from '@/lib/db';

// Step functions must be in the same file for bundler discovery
async function createMachine(input: {
  region: string;
  plan: 'STARTER' | 'PRO';
  instanceId: string;
}) {
  "use step";

  return flyClient.machines.create({
    app: 'clawdbot-instances',
    region: input.region,
    config: {
      image: 'registry.fly.io/clawdbot-gateway:latest',
      guest: machineSpecForPlan(input.plan),
      env: {
        CLAWDBOT_INSTANCE_ID: input.instanceId,
        CLAWDBOT_GATEWAY_PORT: '8080',
      },
      services: [{
        ports: [{ port: 443, handlers: ['tls', 'http'] }],
        protocol: 'tcp',
        internal_port: 8080,
      }],
    },
  });
}

async function createVolume(region: string) {
  "use step";

  return flyClient.volumes.create({
    app: 'clawdbot-instances',
    region,
    size_gb: 1,
    name: `vol-${crypto.randomUUID().slice(0, 8)}`,
  });
}

async function waitForMachineReady(machineId: string) {
  "use step";

  let ready = false;
  let attempts = 0;

  while (!ready && attempts < 30) {
    const status = await flyClient.machines.get(machineId);
    ready = status.state === 'started';
    if (!ready) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  if (!ready) {
    throw new Error('Machine failed to start within timeout');
  }

  return true;
}

async function configureDns(userId: string) {
  "use step";

  const subdomain = `${userId.slice(0, 8)}-${crypto.randomUUID().slice(0, 4)}`;
  const hostname = `${subdomain}.clawdbot.cloud`;

  await flyClient.certificates.create({
    app: 'clawdbot-instances',
    hostname,
  });

  return hostname;
}

async function saveInstance(data: {
  id: string;
  userId: string;
  machineId: string;
  volumeId: string;
  region: string;
  hostname: string;
  plan: 'STARTER' | 'PRO';
}) {
  "use step";

  return db.instance.update({
    where: { id: data.id },
    data: {
      machineId: data.machineId,
      volumeId: data.volumeId,
      hostname: data.hostname,
      status: 'RUNNING',
    },
  });
}

async function sendWelcomeEmail(email: string, hostname: string) {
  "use step";

  // Use Resend, Postmark, or similar
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Clawdbot Cloud <noreply@clawdbot.cloud>',
      to: email,
      subject: 'Your Clawdbot instance is ready!',
      html: `<p>Your instance is live at <a href="https://${hostname}">${hostname}</a></p>`,
    }),
  });
}

// Main workflow function
async function provisionInstance(input: {
  instanceId: string;
  userId: string;
  email: string;
  region: string;
  plan: 'STARTER' | 'PRO';
}) {
  "use workflow";

  // Step 1: Create volume for persistent storage
  const volume = await createVolume(input.region);

  // Step 2: Create the Fly.io machine
  const machine = await createMachine({
    region: input.region,
    plan: input.plan,
    instanceId: input.instanceId,
  });

  // Step 3: Wait for machine to be ready
  await waitForMachineReady(machine.id);

  // Step 4: Configure DNS and TLS
  const hostname = await configureDns(input.userId);

  // Step 5: Update database record
  await saveInstance({
    id: input.instanceId,
    userId: input.userId,
    machineId: machine.id,
    volumeId: volume.id,
    region: input.region,
    hostname,
    plan: input.plan,
  });

  // Step 6: Send welcome email
  await sendWelcomeEmail(input.email, hostname);

  return { machineId: machine.id, hostname };
}

// Export the workflow handler
export const { POST } = serve(provisionInstance);
```

```typescript
// workflows/health-monitor.ts
import { serve, sleep } from '@vercel/workflow';
import { db } from '@/lib/db';
import { flyClient } from '@/lib/fly';

async function checkHealth(hostname: string) {
  "use step";

  try {
    const response = await fetch(`https://${hostname}/health`, {
      signal: AbortSignal.timeout(10000),
    });
    return {
      healthy: response.ok,
      statusCode: response.status,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      statusCode: 0,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function restartMachine(machineId: string) {
  "use step";

  await flyClient.machines.restart(machineId);
}

async function sendAlert(userId: string, message: string) {
  "use step";

  // Send email/SMS/push notification
  console.log(`Alert for user ${userId}: ${message}`);
}

async function healthMonitor(input: { instanceId: string }) {
  "use workflow";

  const instance = await db.instance.findUnique({
    where: { id: input.instanceId },
    include: { user: true },
  });

  if (!instance || instance.status !== 'RUNNING') {
    return { stopped: true, reason: 'Instance not running' };
  }

  let consecutiveFailures = 0;

  // Monitor for 24 hours, then workflow completes and a new one is scheduled
  for (let i = 0; i < 1440; i++) { // 1440 minutes = 24 hours
    const health = await checkHealth(instance.hostname);

    if (!health.healthy) {
      consecutiveFailures++;

      if (consecutiveFailures >= 3) {
        await restartMachine(instance.machineId);
        await sendAlert(
          instance.userId,
          `Your instance ${instance.hostname} was automatically restarted after 3 consecutive health check failures.`
        );
        consecutiveFailures = 0;
      }
    } else {
      consecutiveFailures = 0;
    }

    // Wait 1 minute before next check (durable sleep - no compute cost)
    await sleep("1 minute");
  }

  return { completed: true, checksPerformed: 1440 };
}

export const { POST } = serve(healthMonitor);
```

```typescript
// workflows/usage-aggregator.ts
import { serve, sleep } from '@vercel/workflow';
import { db } from '@/lib/db';
import { flyClient } from '@/lib/fly';
import { PLAN_LIMITS } from '@/lib/plans';

async function fetchMachineMetrics(machineId: string) {
  "use step";

  // Fetch metrics from Fly.io
  const metrics = await flyClient.machines.metrics(machineId);
  return metrics;
}

async function calculateOverages(
  usage: { uptimeMinutes: number; bandwidthMB: number; storageGB: number; messagesProcessed: number },
  plan: 'STARTER' | 'PRO'
) {
  "use step";

  const limits = PLAN_LIMITS[plan];
  const overages = {
    uptimeOverageMinutes: Math.max(0, usage.uptimeMinutes - limits.uptimeMinutes),
    bandwidthOverageMB: Math.max(0, usage.bandwidthMB - limits.bandwidthMB),
    storageOverageGB: Math.max(0, usage.storageGB - limits.storageGB),
    messagesOverage: Math.max(0, usage.messagesProcessed - limits.messages),
  };

  // Calculate overage costs
  const overageCost =
    (overages.uptimeOverageMinutes * 0.001) +  // $0.001 per extra minute
    (overages.bandwidthOverageMB * 0.0001) +   // $0.0001 per MB
    (overages.storageOverageGB * 0.10) +       // $0.10 per GB
    (overages.messagesOverage * 0.0005);       // $0.0005 per message

  return { overages, overageCost };
}

async function saveUsageRecord(data: {
  userId: string;
  instanceId: string;
  periodStart: Date;
  periodEnd: Date;
  uptimeMinutes: number;
  bandwidthMB: number;
  storageGB: number;
  messagesProcessed: number;
  baseCost: number;
  overageCost: number;
}) {
  "use step";

  return db.usageRecord.upsert({
    where: {
      instanceId_periodStart: {
        instanceId: data.instanceId,
        periodStart: data.periodStart,
      },
    },
    create: {
      ...data,
      totalCost: data.baseCost + data.overageCost,
    },
    update: {
      ...data,
      totalCost: data.baseCost + data.overageCost,
    },
  });
}

async function usageAggregator(input: { instanceId: string; periodStart: string }) {
  "use workflow";

  const instance = await db.instance.findUnique({
    where: { id: input.instanceId },
  });

  if (!instance) {
    return { error: 'Instance not found' };
  }

  const periodStart = new Date(input.periodStart);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Aggregate hourly for 30 days
  let totalUsage = {
    uptimeMinutes: 0,
    bandwidthMB: 0,
    storageGB: 0,
    messagesProcessed: 0,
  };

  for (let hour = 0; hour < 720; hour++) { // 720 hours = 30 days
    if (instance.status === 'RUNNING') {
      const metrics = await fetchMachineMetrics(instance.machineId);
      totalUsage.uptimeMinutes += 60;
      totalUsage.bandwidthMB += metrics.bandwidthMB || 0;
      totalUsage.storageGB = metrics.storageGB || totalUsage.storageGB;
      totalUsage.messagesProcessed += metrics.messages || 0;
    }

    await sleep("1 hour");
  }

  // Calculate overages and costs
  const { overages, overageCost } = await calculateOverages(totalUsage, instance.plan);
  const baseCost = instance.plan === 'STARTER' ? 9 : 19;

  // Save final usage record
  await saveUsageRecord({
    userId: instance.userId,
    instanceId: instance.id,
    periodStart,
    periodEnd,
    ...totalUsage,
    baseCost,
    overageCost,
  });

  return { totalUsage, overages, overageCost, totalCost: baseCost + overageCost };
}

export const { POST } = serve(usageAggregator);
```

**Workflow Use Cases:**
- **Instance Provisioning**: Multi-step machine creation with retries
- **Health Monitoring**: Periodic checks that survive deployments
- **Usage Aggregation**: Hourly metrics collection for overage billing
- **Backup Scheduling**: Daily/weekly volume snapshots

#### 1.5 API Routes

```typescript
// app/api/instances/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/plans';

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const plan = body.plan || 'STARTER';

  // Validate plan limits
  const existingCount = await db.instance.count({
    where: { userId: session.user.id, status: { not: 'DELETED' } },
  });

  const limit = PLAN_LIMITS[plan].instances;
  if (existingCount >= limit) {
    return Response.json({ error: 'Instance limit reached' }, { status: 403 });
  }

  // Create instance record in pending state
  const instance = await db.instance.create({
    data: {
      userId: session.user.id,
      machineId: '', // Will be set by workflow
      region: body.region || 'iad',
      hostname: '', // Will be set by workflow
      plan,
      status: 'PROVISIONING',
    },
  });

  // Trigger provisioning workflow
  const workflowResponse = await fetch(`${process.env.VERCEL_URL}/workflows/provision-instance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instanceId: instance.id,
      userId: session.user.id,
      email: session.user.email,
      region: body.region || 'iad',
      plan,
    }),
  });

  const { runId } = await workflowResponse.json();

  return Response.json({
    instanceId: instance.id,
    workflowRunId: runId,
    status: 'provisioning',
  });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const instances = await db.instance.findMany({
    where: { userId: session.user.id, status: { not: 'DELETED' } },
    include: {
      usageRecords: {
        take: 1,
        orderBy: { periodStart: 'desc' },
      },
    },
  });

  return Response.json(instances);
}
```

```typescript
// app/api/usage/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const instanceId = searchParams.get('instanceId');
  const period = searchParams.get('period') || 'current';

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await db.usageRecord.findMany({
    where: {
      userId: session.user.id,
      ...(instanceId && { instanceId }),
      periodStart: { gte: periodStart },
    },
    include: {
      instance: {
        select: { hostname: true, plan: true, region: true },
      },
    },
  });

  // Aggregate totals
  const totals = usage.reduce(
    (acc, record) => ({
      baseCost: acc.baseCost + record.baseCost,
      overageCost: acc.overageCost + record.overageCost,
      totalCost: acc.totalCost + record.totalCost,
      uptimeMinutes: acc.uptimeMinutes + record.uptimeMinutes,
      bandwidthMB: acc.bandwidthMB + record.bandwidthMB,
      messagesProcessed: acc.messagesProcessed + record.messagesProcessed,
    }),
    { baseCost: 0, overageCost: 0, totalCost: 0, uptimeMinutes: 0, bandwidthMB: 0, messagesProcessed: 0 }
  );

  return Response.json({ records: usage, totals });
}
```

### 2. Data Plane (Fly.io Machines)

Fly.io provides the actual compute for running Clawdbot instances.

#### 2.1 Why Fly.io?

| Feature | Fly.io Advantage |
|---------|------------------|
| **Firecracker MicroVMs** | True isolation between tenants |
| **Machines API** | Programmatic control over VM lifecycle |
| **Global Regions** | 18+ regions for low-latency access |
| **Persistent Volumes** | Durable storage for configs |
| **Anycast Networking** | Single IP routes to nearest region |
| **Fast Boot** | ~300ms cold start |
| **WebSocket Support** | First-class persistent connections |

#### 2.2 Custom Clawdbot Docker Image

```dockerfile
# Dockerfile for hosted Clawdbot
FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash clawdbot
USER clawdbot
WORKDIR /home/clawdbot

# Install Clawdbot
RUN npm install -g clawdbot@latest

# Platform-specific patches
COPY --chown=clawdbot:clawdbot ./hosting-patches/ ./patches/

# Health check endpoint
COPY --chown=clawdbot:clawdbot ./health-server.js ./

# Volumes
VOLUME ["/home/clawdbot/.clawdbot", "/home/clawdbot/clawd"]

# Environment
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV CLAWDBOT_STATE_DIR="/home/clawdbot/.clawdbot"
ENV CLAWDBOT_WORKSPACE_DIR="/home/clawdbot/clawd"

# Expose gateway port
EXPOSE 8080

# Entrypoint with hosting wrapper
COPY --chown=clawdbot:clawdbot ./entrypoint.sh ./
ENTRYPOINT ["./entrypoint.sh"]
```

```bash
#!/bin/bash
# entrypoint.sh

# Start health check sidecar
node /home/clawdbot/health-server.js &

# Initialize config if needed
if [ ! -f "$CLAWDBOT_STATE_DIR/clawdbot.json" ]; then
  echo "Initializing default config..."
  cp /home/clawdbot/patches/default-config.json "$CLAWDBOT_STATE_DIR/clawdbot.json"
fi

# Inject secrets from environment
envsubst < "$CLAWDBOT_STATE_DIR/clawdbot.json.template" > "$CLAWDBOT_STATE_DIR/clawdbot.json"

# Start Clawdbot gateway
exec clawdbot gateway \
  --port "${CLAWDBOT_GATEWAY_PORT:-8080}" \
  --bind lan \
  --verbose
```

#### 2.3 Machine Configuration by Plan

```typescript
// lib/fly/machine-specs.ts
export function machineSpecForPlan(plan: 'STARTER' | 'PRO') {
  switch (plan) {
    case 'STARTER':
      return {
        cpu_kind: 'shared',
        cpus: 1,
        memory_mb: 1024, // 1GB - limited functionality
      };
    case 'PRO':
      return {
        cpu_kind: 'shared',
        cpus: 2,
        memory_mb: 2048, // 2GB - recommended for full features
      };
    default:
      throw new Error(`Unknown plan: ${plan}`);
  }
}
```

#### 2.4 Networking & Port Configuration

```typescript
// lib/fly/services-config.ts
export const servicesConfig = [
  {
    // Main gateway (HTTPS)
    ports: [
      { port: 443, handlers: ['tls', 'http'] },
      { port: 80, handlers: ['http'], force_https: true },
    ],
    protocol: 'tcp',
    internal_port: 8080,
    concurrency: {
      type: 'connections',
      hard_limit: 100,
      soft_limit: 80,
    },
  },
];
```

### 3. Secrets Management

#### 3.1 Architecture Options

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Doppler** | Easy integration, great DX | $$$$ at scale | Startups |
| **Infisical** | Open source option, self-hostable | Less mature | Privacy-focused |
| **HashiCorp Vault** | Enterprise-grade, namespaces | Complex to operate | Large scale |
| **Fly.io Secrets** | Built-in, simple | No rotation, basic | MVP |

#### 3.2 Recommended: Doppler Integration

```typescript
// lib/secrets/doppler.ts
import { Doppler } from '@doppler-sdk/node';

const doppler = new Doppler({
  accessToken: process.env.DOPPLER_TOKEN,
});

export async function getInstanceSecrets(instanceId: string) {
  // Each instance has its own Doppler config
  const secrets = await doppler.secrets.list({
    project: 'clawdbot-instances',
    config: instanceId, // per-tenant config
  });

  return secrets.reduce((acc, s) => {
    acc[s.name] = s.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function setInstanceSecret(
  instanceId: string,
  key: string,
  value: string
) {
  await doppler.secrets.update({
    project: 'clawdbot-instances',
    config: instanceId,
    secrets: { [key]: value },
  });

  // Trigger instance restart to pick up new secrets
  await triggerInstanceRestart(instanceId);
}
```

### 4. Authentication Flow

#### 4.1 User Authentication (Better Auth)

```
┌──────────┐       ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  User    │       │  Dashboard  │       │  API Route   │       │  Clawdbot   │
│ Browser  │       │  (Vercel)   │       │  (Vercel)    │       │  (Fly.io)   │
└────┬─────┘       └──────┬──────┘       └──────┬───────┘       └──────┬──────┘
     │                    │                     │                      │
     │ 1. Login (Better Auth)                   │                      │
     │───────────────────>│                     │                      │
     │                    │                     │                      │
     │ 2. Session Cookie  │                     │                      │
     │<───────────────────│                     │                      │
     │                    │                     │                      │
     │ 3. Request instance access               │                      │
     │───────────────────────────────────────-->│                      │
     │                    │                     │                      │
     │                    │  4. Verify session  │                      │
     │                    │     + ownership     │                      │
     │                    │                     │                      │
     │                    │  5. Generate short-lived token             │
     │                    │───────────────────────────────────────────>│
     │                    │                     │                      │
     │ 6. Return instance URL + token           │                      │
     │<─────────────────────────────────────────│                      │
     │                    │                     │                      │
     │ 7. Connect directly to Clawdbot gateway  │                      │
     │─────────────────────────────────────────────────────────────────>
     │                    │                     │                      │
```

```typescript
// app/api/instances/[id]/access/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const instance = await db.instance.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!instance) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Generate short-lived access token for the Clawdbot instance
  const accessToken = await new SignJWT({
    sub: session.user.id,
    instanceId: instance.id,
    permissions: ['connect', 'configure'],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  return Response.json({
    hostname: instance.hostname,
    accessToken,
    gatewayUrl: `wss://${instance.hostname}/gateway`,
    expiresIn: 3600,
  });
}
```

### 5. Monitoring & Observability

#### 5.1 Health Checks

```typescript
// deployed in each Clawdbot instance: health-server.js
const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    // Check if Clawdbot gateway is responding
    exec('clawdbot health', (error, stdout) => {
      if (error) {
        res.writeHead(503);
        res.end(JSON.stringify({ status: 'unhealthy', error: error.message }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'healthy', details: stdout }));
      }
    });
  } else if (req.url === '/metrics') {
    // Prometheus metrics
    res.writeHead(200);
    res.end(getPrometheusMetrics());
  }
});

server.listen(9090);
```

#### 5.2 Centralized Logging

```typescript
// lib/logging/axiom.ts
import { Axiom } from '@axiomhq/axiom-node';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

export async function ingestLogs(instanceId: string, logs: string[]) {
  await axiom.ingest('clawdbot-logs', logs.map(log => ({
    _time: new Date().toISOString(),
    instanceId,
    message: log,
  })));
}
```

---

## Pricing Model with Overage Tracking

### Plan Limits

```typescript
// lib/plans.ts
export const PLAN_LIMITS = {
  STARTER: {
    price: 9, // USD/month
    instances: 1,
    uptimeMinutes: 43200, // 30 days
    bandwidthMB: 5120, // 5GB
    storageGB: 1,
    messages: 10000,
  },
  PRO: {
    price: 19, // USD/month
    instances: 3,
    uptimeMinutes: 43200, // 30 days per instance
    bandwidthMB: 20480, // 20GB
    storageGB: 5,
    messages: 50000,
  },
} as const;

export const OVERAGE_RATES = {
  uptimePerMinute: 0.001, // $0.001/minute ($0.06/hour)
  bandwidthPerMB: 0.0001, // $0.0001/MB ($0.10/GB)
  storagePerGB: 0.10, // $0.10/GB/month
  messagePerUnit: 0.0005, // $0.0005/message
} as const;
```

### Cost Structure

| Component | Cost Basis | Starter Instance | Pro Instance |
|-----------|-----------|-----------------|--------------|
| **Fly.io Machine** | Compute | $5.70/mo | $10.70/mo |
| **Fly.io Volume** | Storage | $0.15/GB | $0.75/5GB |
| **Fly.io Bandwidth** | Egress | ~$0.50 (5GB) | ~$2.00 (20GB) |
| **Platform overhead** | Amortized | $0.50 | $0.50 |
| **Total cost** | | ~$6.85 | ~$13.95 |

### Pricing Tiers

| Tier | Price | Included | Overage |
|------|-------|----------|---------|
| **Starter** | $9/mo | 1 instance, 1 vCPU, 1GB RAM, 1GB storage, 5GB bandwidth, 10K messages | Per-unit rates above |
| **Pro** | $19/mo | 3 instances, 2 vCPU, 2GB RAM, 5GB storage, 20GB bandwidth, 50K messages | Per-unit rates above |

### Margin Analysis

| Tier | Revenue | Base Cost | Margin | Break-even Overage |
|------|---------|-----------|--------|-------------------|
| **Starter** | $9 | $6.85 | 24% (~$2.15) | N/A |
| **Pro** | $19 | $13.95 | 27% (~$5.05) | N/A |

**Overage Profit**: All overage revenue is ~90% margin (metering cost only).

### Usage Dashboard Component

```typescript
// components/UsageDashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { PLAN_LIMITS, OVERAGE_RATES } from '@/lib/plans';

export function UsageDashboard({ instanceId }: { instanceId: string }) {
  const { data: usage } = useQuery({
    queryKey: ['usage', instanceId],
    queryFn: () => fetch(`/api/usage?instanceId=${instanceId}`).then(r => r.json()),
  });

  if (!usage) return <div>Loading...</div>;

  const plan = usage.records[0]?.instance.plan || 'STARTER';
  const limits = PLAN_LIMITS[plan];

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">Current Period Usage</h2>

      <UsageBar
        label="Uptime"
        current={usage.totals.uptimeMinutes}
        limit={limits.uptimeMinutes}
        unit="minutes"
        overageRate={OVERAGE_RATES.uptimePerMinute}
      />

      <UsageBar
        label="Bandwidth"
        current={usage.totals.bandwidthMB}
        limit={limits.bandwidthMB}
        unit="MB"
        overageRate={OVERAGE_RATES.bandwidthPerMB}
      />

      <UsageBar
        label="Messages"
        current={usage.totals.messagesProcessed}
        limit={limits.messages}
        unit="messages"
        overageRate={OVERAGE_RATES.messagePerUnit}
      />

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between">
          <span>Base cost</span>
          <span>${usage.totals.baseCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-amber-600">
          <span>Overage cost</span>
          <span>${usage.totals.overageCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total</span>
          <span>${usage.totals.totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function UsageBar({ label, current, limit, unit, overageRate }) {
  const percentage = Math.min((current / limit) * 100, 100);
  const overage = Math.max(0, current - limit);
  const isOverLimit = current > limit;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isOverLimit ? 'text-amber-600' : ''}>
          {current.toLocaleString()} / {limit.toLocaleString()} {unit}
          {overage > 0 && ` (+${overage.toLocaleString()} overage)`}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${isOverLimit ? 'bg-amber-500' : 'bg-green-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {overage > 0 && (
        <div className="text-xs text-amber-600 mt-1">
          Overage: ${(overage * overageRate).toFixed(2)}
        </div>
      )}
    </div>
  );
}
```

---

## Implementation Roadmap

### Phase 1: MVP (Core Platform)

**Goal**: Allow users to deploy and manage a single Clawdbot instance

- [ ] Next.js 15 project setup with App Router
- [ ] PostgreSQL database (Neon/Supabase) + Prisma
- [ ] Better Auth integration (email + GitHub OAuth)
- [ ] Fly.io Machines API integration
- [ ] Basic provisioning workflow (Vercel Workflows)
- [ ] Instance start/stop/restart
- [ ] Simple config editor
- [ ] Fly.io volume management
- [ ] Basic health monitoring workflow
- [ ] Stripe billing integration with usage tracking

### Phase 2: Configuration & Channels

**Goal**: Easy setup of messaging channels

- [ ] Telegram bot setup wizard
- [ ] Discord bot setup wizard
- [ ] WhatsApp Business API integration guide
- [ ] Slack app installation flow
- [ ] Secrets management (Doppler integration)
- [ ] Visual config editor with validation
- [ ] Config import/export

### Phase 3: Observability & Billing

**Goal**: Production-ready monitoring and overage billing

- [ ] Real-time log streaming
- [ ] Metrics dashboard (CPU, memory, messages)
- [ ] Usage aggregation workflow (hourly)
- [ ] Overage calculation and display
- [ ] Stripe metered billing webhooks
- [ ] Auto-restart on failures
- [ ] Volume backup/restore

### Phase 4: Scale & Polish

**Goal**: Growth features

- [ ] Multi-region deployment
- [ ] Custom domain support
- [ ] API access for automation
- [ ] Browser automation (Pro only)
- [ ] Voice mode support (Pro only)
- [ ] Referral program

---

## Alternative Architectures Considered

### Option A: Kubernetes on AWS/GCP

**Pros:**
- Maximum control
- Better cost at scale (100+ instances)
- Can use Spot instances

**Cons:**
- Significant DevOps overhead
- Slower iteration
- Complex networking

**Verdict**: Overkill for initial launch; consider for 500+ instances

### Option B: Railway

**Pros:**
- Simpler than Fly.io
- Good DX
- Native Docker support

**Cons:**
- Less mature Machines API
- Fewer regions
- Higher per-instance cost

**Verdict**: Good alternative if Fly.io complexity is too high

### Option C: Vercel Sandbox Only

**Pros:**
- Single vendor
- Great DX
- Built-in durability via Workflows

**Cons:**
- Max 5 hours runtime (kills the use case)
- Single region
- No persistent storage
- Cannot run WebSocket gateway 24/7

**Verdict**: **Not viable** for Clawdbot hosting

---

## Security Considerations

### Tenant Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                    ISOLATION LAYERS                             │
│                                                                 │
│  1. Compute Isolation                                           │
│     └── Each tenant runs in separate Firecracker microVM        │
│         (Fly.io Machines provide this by default)               │
│                                                                 │
│  2. Network Isolation                                           │
│     └── Each machine gets unique IPv6 + shared IPv4 via proxy   │
│     └── No direct machine-to-machine communication              │
│                                                                 │
│  3. Storage Isolation                                           │
│     └── Dedicated Fly Volume per instance                       │
│     └── Encrypted at rest                                       │
│                                                                 │
│  4. Secrets Isolation                                           │
│     └── Per-instance Doppler config                             │
│     └── Secrets never stored in database                        │
│                                                                 │
│  5. Access Control                                              │
│     └── Database-enforced ownership checks                      │
│     └── Short-lived access tokens (1 hour)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Compliance Considerations

| Requirement | Solution |
|-------------|----------|
| **Data Residency** | Region selection per instance |
| **Encryption at Rest** | Fly.io volumes encrypted by default |
| **Encryption in Transit** | TLS everywhere |
| **Access Logging** | All API calls logged to Axiom |
| **SOC 2** | Rely on Fly.io + Vercel compliance |

---

## Conclusion

The proposed **hybrid architecture** using **Vercel for the control plane** and **Fly.io Machines for the data plane** provides:

1. **Durability**: Vercel Workflows for orchestration, Fly.io for 24/7 instances
2. **Security**: MicroVM isolation, per-tenant secrets, short-lived tokens
3. **Developer Experience**: Modern Next.js dashboard, Better Auth for flexibility
4. **Cost Efficiency**: Usage-based pricing with overage tracking for healthy margins
5. **Scalability**: Can grow from 10 to 10,000 instances without architecture changes

This architecture leverages your preference for Vercel products where they excel (frontend, workflows, edge) while using purpose-built infrastructure (Fly.io) for the workloads that require persistent compute.

### Next Steps

1. **Validate with PoC**: Build minimal provisioning flow end-to-end
2. **User Research**: Interview potential customers about pricing/features
3. **Legal Review**: Terms of Service for hosted AI assistants
4. **Partnership**: Reach out to Clawdbot team about official hosting partnership

---

## Sources

- [Vercel Workflow DevKit Documentation](https://useworkflow.dev)
- [Vercel Workflow GitHub](https://github.com/vercel/workflow)
- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Better Auth Installation Guide](https://www.better-auth.com/docs/installation)
- [Fly.io Machines API](https://fly.io/docs/machines/api/)
- [Fly.io Architecture Reference](https://fly.io/docs/reference/architecture/)
