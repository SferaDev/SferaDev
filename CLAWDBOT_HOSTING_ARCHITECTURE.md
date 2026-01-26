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
│  │  └─────────────────┘  └──────────────────┘  └─────────────────────────────┘   │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                      Vercel KV / Postgres                               │   │ │
│  │  │  • User accounts        • Instance metadata        • Billing records    │   │ │
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
│  │  │ │(1-10GB) │ │        │ │(1-10GB) │ │        │ │(1-10GB) │ │                 │ │
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

#### 1.1 Next.js Dashboard Application

```typescript
// app/dashboard/instances/page.tsx
export default async function InstancesPage() {
  const instances = await db.instances.findMany({
    where: { userId: auth().userId }
  });

  return (
    <div className="grid gap-4">
      {instances.map(instance => (
        <InstanceCard
          key={instance.id}
          instance={instance}
          onStart={() => startInstance(instance.id)}
          onStop={() => stopInstance(instance.id)}
          onConfigure={() => router.push(`/instances/${instance.id}/config`)}
        />
      ))}
    </div>
  );
}
```

**Features:**
- **Authentication**: Clerk or Auth.js with OAuth providers
- **Instance Management**: Create, start, stop, delete instances
- **Configuration Editor**: Visual editor for `clawdbot.json`
- **Logs Viewer**: Real-time log streaming from instances
- **Billing**: Stripe integration for usage-based billing
- **Messaging Setup Wizards**: Guided setup for WhatsApp, Telegram, etc.

#### 1.2 Vercel Workflows (Orchestration)

Workflows provide durable execution for long-running operations:

```typescript
// app/api/workflows/provision-instance.ts
'use workflow';

import { sleep, step } from '@vercel/workflow';
import { flyClient } from '@/lib/fly';
import { db } from '@/lib/db';

export async function provisionInstance(input: {
  userId: string;
  region: string;
  plan: 'starter' | 'pro' | 'enterprise';
}) {
  'use step';
  // Step 1: Create Fly.io Machine
  const machine = await step('create-machine', async () => {
    return flyClient.machines.create({
      app: 'clawdbot-instances',
      region: input.region,
      config: {
        image: 'registry.fly.io/clawdbot-gateway:latest',
        guest: machineSpecForPlan(input.plan),
        env: {
          CLAWDBOT_INSTANCE_ID: generateId(),
          CLAWDBOT_GATEWAY_PORT: '8080',
        },
        services: [{
          ports: [{ port: 443, handlers: ['tls', 'http'] }],
          protocol: 'tcp',
          internal_port: 8080,
        }],
        mounts: [{
          volume: await createVolume(input.region),
          path: '/home/node/.clawdbot',
        }],
      },
    });
  });

  'use step';
  // Step 2: Wait for machine to be ready
  await step('wait-for-ready', async () => {
    let ready = false;
    while (!ready) {
      const status = await flyClient.machines.get(machine.id);
      ready = status.state === 'started';
      if (!ready) await sleep('5 seconds');
    }
  });

  'use step';
  // Step 3: Configure DNS
  const hostname = await step('configure-dns', async () => {
    const subdomain = `${input.userId}-clawdbot`;
    await flyClient.certificates.create({
      app: 'clawdbot-instances',
      hostname: `${subdomain}.clawdbot.cloud`,
    });
    return `${subdomain}.clawdbot.cloud`;
  });

  'use step';
  // Step 4: Store in database
  await step('save-to-db', async () => {
    return db.instances.create({
      data: {
        userId: input.userId,
        machineId: machine.id,
        region: input.region,
        hostname,
        plan: input.plan,
        status: 'running',
      },
    });
  });

  'use step';
  // Step 5: Send welcome notification
  await step('notify-user', async () => {
    await sendEmail({
      to: input.userId,
      template: 'instance-ready',
      data: { hostname },
    });
  });

  return { machineId: machine.id, hostname };
}
```

**Workflow Use Cases:**
- **Instance Provisioning**: Multi-step machine creation with retries
- **Health Monitoring**: Periodic checks that survive deployments
- **Backup Scheduling**: Daily/weekly volume snapshots
- **Scaling Operations**: Auto-scale based on usage metrics
- **Onboarding Flows**: Multi-day email sequences

#### 1.3 API Routes

```typescript
// app/api/instances/route.ts
import { auth } from '@clerk/nextjs';
import { flyClient } from '@/lib/fly';

export async function POST(request: Request) {
  const { userId } = auth();
  const body = await request.json();

  // Validate plan limits
  const existingCount = await db.instances.count({ where: { userId } });
  const limit = await getUserPlanLimit(userId);
  if (existingCount >= limit) {
    return Response.json({ error: 'Instance limit reached' }, { status: 403 });
  }

  // Trigger provisioning workflow
  const { runId } = await startWorkflow('provision-instance', {
    userId,
    region: body.region || 'iad',
    plan: body.plan || 'starter',
  });

  return Response.json({ workflowRunId: runId, status: 'provisioning' });
}

export async function GET(request: Request) {
  const { userId } = auth();
  const instances = await db.instances.findMany({
    where: { userId },
    include: { metrics: { take: 1, orderBy: { createdAt: 'desc' } } },
  });

  // Enrich with real-time status from Fly.io
  const enriched = await Promise.all(
    instances.map(async (instance) => {
      const machine = await flyClient.machines.get(instance.machineId);
      return {
        ...instance,
        realTimeStatus: machine.state,
        uptime: machine.created_at,
      };
    })
  );

  return Response.json(enriched);
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
export function machineSpecForPlan(plan: string) {
  switch (plan) {
    case 'starter':
      return {
        cpu_kind: 'shared',
        cpus: 1,
        memory_mb: 1024, // 1GB - limited functionality
      };
    case 'pro':
      return {
        cpu_kind: 'shared',
        cpus: 2,
        memory_mb: 2048, // 2GB - recommended
      };
    case 'enterprise':
      return {
        cpu_kind: 'performance', // Dedicated CPU
        cpus: 4,
        memory_mb: 4096, // 4GB - full features + browser automation
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
  {
    // WebSocket upgrade path
    ports: [{ port: 443, handlers: ['tls'] }],
    protocol: 'tcp',
    internal_port: 8080,
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

#### 3.3 Secret Categories for Clawdbot

```typescript
// types/secrets.ts
export interface ClawdbotSecrets {
  // AI Providers
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;

  // Messaging Platforms
  TELEGRAM_BOT_TOKEN?: string;
  DISCORD_TOKEN?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;

  // Voice
  ELEVENLABS_API_KEY?: string;
  DEEPGRAM_API_KEY?: string;

  // Platform
  CLAWDBOT_GATEWAY_TOKEN: string; // Auto-generated

  // Custom user secrets
  [key: string]: string | undefined;
}
```

### 4. Configuration Management

#### 4.1 Visual Config Editor

```typescript
// components/config-editor/ClawdbotConfigEditor.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clawdbotConfigSchema } from '@/lib/schemas/clawdbot-config';

export function ClawdbotConfigEditor({ instanceId, initialConfig }) {
  const form = useForm({
    resolver: zodResolver(clawdbotConfigSchema),
    defaultValues: initialConfig,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* AI Provider Section */}
        <ConfigSection title="AI Provider">
          <SelectField
            name="model"
            label="Default Model"
            options={[
              { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
              { value: 'anthropic/claude-opus-4', label: 'Claude Opus 4' },
              { value: 'openai/gpt-4o', label: 'GPT-4o' },
            ]}
          />
          <NumberField
            name="maxTokens"
            label="Max Tokens"
            min={1000}
            max={200000}
          />
        </ConfigSection>

        {/* Messaging Channels Section */}
        <ConfigSection title="Messaging Channels">
          <ChannelToggle channel="telegram" />
          <ChannelToggle channel="discord" />
          <ChannelToggle channel="whatsapp" />
          <ChannelToggle channel="slack" />
        </ConfigSection>

        {/* Security Section */}
        <ConfigSection title="Security">
          <SelectField
            name="gateway.auth.mode"
            label="Auth Mode"
            options={[
              { value: 'token', label: 'Token (Recommended)' },
              { value: 'none', label: 'None (Not Recommended)' },
            ]}
          />
          <TextField
            name="pairing.allowlist"
            label="Allowed Contacts"
            placeholder="+1234567890, user@example.com"
          />
        </ConfigSection>

        {/* Tool Permissions */}
        <ConfigSection title="Tool Permissions">
          <SelectField
            name="toolProfile"
            label="Tool Profile"
            options={[
              { value: 'minimal', label: 'Minimal (Safe)' },
              { value: 'coding', label: 'Coding (File Access)' },
              { value: 'full', label: 'Full (All Tools)' },
            ]}
          />
        </ConfigSection>

        <Button type="submit">Save & Restart</Button>
      </form>
    </Form>
  );
}
```

#### 4.2 Config Validation Schema

```typescript
// lib/schemas/clawdbot-config.ts
import { z } from 'zod';

export const clawdbotConfigSchema = z.object({
  model: z.string().default('anthropic/claude-sonnet-4'),
  maxTokens: z.number().min(1000).max(200000).default(8192),

  gateway: z.object({
    port: z.number().default(8080),
    auth: z.object({
      mode: z.enum(['token', 'none']).default('token'),
    }),
  }),

  channels: z.object({
    telegram: z.object({
      enabled: z.boolean().default(false),
      botUsername: z.string().optional(),
    }),
    discord: z.object({
      enabled: z.boolean().default(false),
      guildId: z.string().optional(),
    }),
    whatsapp: z.object({
      enabled: z.boolean().default(false),
      phoneNumber: z.string().optional(),
    }),
    slack: z.object({
      enabled: z.boolean().default(false),
      workspaceId: z.string().optional(),
    }),
  }),

  security: z.object({
    toolProfile: z.enum(['minimal', 'coding', 'messaging', 'full']).default('minimal'),
    allowedTools: z.array(z.string()).optional(),
    deniedTools: z.array(z.string()).optional(),
  }),

  features: z.object({
    browserAutomation: z.boolean().default(false),
    voiceMode: z.boolean().default(false),
    canvas: z.boolean().default(false),
  }),
});
```

### 5. Authentication Flow

#### 5.1 User Authentication (Clerk)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

#### 5.2 Instance Access Flow

```
┌──────────┐       ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  User    │       │  Dashboard  │       │  API Route   │       │  Clawdbot   │
│ Browser  │       │  (Vercel)   │       │  (Vercel)    │       │  (Fly.io)   │
└────┬─────┘       └──────┬──────┘       └──────┬───────┘       └──────┬──────┘
     │                    │                     │                      │
     │ 1. Login via Clerk │                     │                      │
     │───────────────────>│                     │                      │
     │                    │                     │                      │
     │ 2. JWT Token       │                     │                      │
     │<───────────────────│                     │                      │
     │                    │                     │                      │
     │ 3. Request instance access               │                      │
     │───────────────────────────────────────-->│                      │
     │                    │                     │                      │
     │                    │  4. Verify ownership│                      │
     │                    │     (DB lookup)     │                      │
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
import { auth } from '@clerk/nextjs';
import { SignJWT } from 'jose';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  // Verify ownership
  const instance = await db.instances.findFirst({
    where: { id: params.id, userId },
  });

  if (!instance) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Generate short-lived access token
  const accessToken = await new SignJWT({
    sub: userId,
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

### 6. Monitoring & Observability

#### 6.1 Health Checks

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

#### 6.2 Centralized Logging

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

// Stream logs from instance
export async function streamLogs(instanceId: string) {
  const instance = await db.instances.findUnique({ where: { id: instanceId } });

  // Connect to Fly.io log stream
  const logStream = await flyClient.machines.logs(instance.machineId, {
    follow: true,
  });

  for await (const log of logStream) {
    await ingestLogs(instanceId, [log]);
    yield log; // For real-time streaming to dashboard
  }
}
```

#### 6.3 Alerting Workflow

```typescript
// app/api/workflows/health-monitor.ts
'use workflow';

import { sleep, step } from '@vercel/workflow';

export async function healthMonitor(input: { instanceId: string }) {
  while (true) {
    'use step';
    const health = await step('check-health', async () => {
      const instance = await db.instances.findUnique({
        where: { id: input.instanceId },
      });

      const response = await fetch(`https://${instance.hostname}/health`);
      return {
        healthy: response.ok,
        statusCode: response.status,
        checkedAt: new Date().toISOString(),
      };
    });

    if (!health.healthy) {
      'use step';
      await step('handle-unhealthy', async () => {
        // Increment failure counter
        const failures = await redis.incr(`health:failures:${input.instanceId}`);

        if (failures >= 3) {
          // Auto-restart after 3 failures
          await restartInstance(input.instanceId);
          await redis.set(`health:failures:${input.instanceId}`, 0);

          // Notify user
          await sendAlert({
            instanceId: input.instanceId,
            type: 'auto-restart',
            message: 'Your instance was automatically restarted due to health check failures',
          });
        }
      });
    } else {
      // Reset failure counter on success
      await redis.set(`health:failures:${input.instanceId}`, 0);
    }

    // Check every 60 seconds
    await sleep('60 seconds');
  }
}
```

---

## Pricing Model

### Cost Structure

| Component | Cost Basis | Estimated per Instance |
|-----------|-----------|----------------------|
| **Fly.io Machine (Starter)** | $5.70/mo (shared-cpu-1x, 1GB) | $5.70 |
| **Fly.io Machine (Pro)** | $10.70/mo (shared-cpu-2x, 2GB) | $10.70 |
| **Fly.io Volume (1GB)** | $0.15/GB/mo | $0.15 |
| **Fly.io Bandwidth** | $0.02/GB after 100GB | ~$0.50 |
| **Vercel (Control Plane)** | Pro plan $20/mo | $0.20 (amortized) |
| **Doppler (Secrets)** | $6/user/mo | $0.50 (amortized) |

### Suggested Pricing Tiers

| Tier | Price | Specs | Target |
|------|-------|-------|--------|
| **Starter** | $9/mo | 1 vCPU, 1GB RAM, 1GB storage | Personal use |
| **Pro** | $19/mo | 2 vCPU, 2GB RAM, 5GB storage | Power users |
| **Team** | $49/mo | 2 vCPU, 4GB RAM, 10GB storage, priority support | Small teams |
| **Enterprise** | Custom | Dedicated CPU, custom limits, SLA | Organizations |

### Margin Analysis

| Tier | Revenue | Cost | Gross Margin |
|------|---------|------|--------------|
| Starter | $9 | ~$6.50 | 28% |
| Pro | $19 | ~$11.50 | 40% |
| Team | $49 | ~$20 | 59% |

---

## Implementation Roadmap

### Phase 1: MVP (Core Platform)

**Goal**: Allow users to deploy and manage a single Clawdbot instance

- [ ] Vercel project setup with Next.js 15
- [ ] Clerk authentication integration
- [ ] Fly.io Machines API integration
- [ ] Basic provisioning workflow
- [ ] Instance start/stop/restart
- [ ] Simple config editor
- [ ] Fly.io volume management
- [ ] Basic health monitoring
- [ ] Stripe billing integration

### Phase 2: Configuration & Channels

**Goal**: Easy setup of messaging channels

- [ ] Telegram bot setup wizard
- [ ] Discord bot setup wizard
- [ ] WhatsApp Business API integration guide
- [ ] Slack app installation flow
- [ ] Secrets management (Doppler integration)
- [ ] Visual config editor
- [ ] Config validation

### Phase 3: Observability & Operations

**Goal**: Production-ready monitoring and operations

- [ ] Real-time log streaming
- [ ] Metrics dashboard (CPU, memory, messages)
- [ ] Alerting system
- [ ] Auto-restart on failures
- [ ] Volume backup/restore
- [ ] Instance cloning

### Phase 4: Advanced Features

**Goal**: Differentiated features for higher tiers

- [ ] Multi-region deployment
- [ ] Custom domain support
- [ ] Team/organization accounts
- [ ] API access for automation
- [ ] Browser automation tier
- [ ] Voice mode support

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

### Option D: Self-Managed Firecracker

**Pros:**
- Maximum isolation
- Lowest cost at scale
- Full control

**Cons:**
- Massive engineering investment
- Need to build orchestration from scratch
- Long time to market

**Verdict**: Only if building this as core business

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
│     └── Short-lived access tokens                               │
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
3. **Developer Experience**: Modern Next.js dashboard, visual config editor
4. **Cost Efficiency**: Usage-based pricing, reasonable margins
5. **Scalability**: Can grow from 10 to 10,000 instances without architecture changes

This architecture leverages your preference for Vercel products where they excel (frontend, workflows, edge) while using purpose-built infrastructure (Fly.io) for the workloads that require persistent compute.

### Next Steps

1. **Validate with PoC**: Build minimal provisioning flow end-to-end
2. **User Research**: Interview potential customers about pricing/features
3. **Legal Review**: Terms of Service for hosted AI assistants
4. **Partnership**: Reach out to Clawdbot team about official hosting partnership
