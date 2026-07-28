# litellm-api

Auto-generated, fully typed client for the [LiteLLM proxy API](https://docs.litellm.ai/docs/proxy/quick_start).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation

## Installation

```bash
npm install litellm-api
```

## Quick Start

LiteLLM is self-hosted, so the client requires the `baseUrl` of your proxy:

```ts
import { LiteLLMApi } from "litellm-api";

const client = new LiteLLMApi({
  baseUrl: "http://localhost:4000",
  token: process.env.LITELLM_MASTER_KEY ?? null,
});

const usage = await client.api.billing.checkUsageBillingUsageGet();
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new LiteLLMApi({
  baseUrl: "http://localhost:4000",
  token: process.env.LITELLM_MASTER_KEY ?? null,
  fetch: myFetchImplementation,
});
```

## Entrypoints

| Import | Contents |
| --- | --- |
| `litellm-api` | client class, operations, schemas and types |
| `litellm-api/components` | operations grouped by tag and by path |
| `litellm-api/schemas` | Zod schemas for every operation |
| `litellm-api/types` | TypeScript types for every operation |

## License

ISC
