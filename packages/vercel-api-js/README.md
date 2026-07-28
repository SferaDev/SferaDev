# vercel-api-js

Auto-generated, fully typed client for the [Vercel REST API](https://vercel.com/docs/rest-api).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation
- **Effect support** - optional [Effect](https://effect.website) bindings via `vercel-api-js/effect`

## Installation

```bash
npm install vercel-api-js
```

## Quick Start

```ts
import { VercelApi } from "vercel-api-js";

const client = new VercelApi({ token: process.env.VERCEL_TOKEN ?? null });

const accessGroups = await client.api.accessGroups.listAccessGroups({});
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new VercelApi({
  token: process.env.VERCEL_TOKEN ?? null,
  fetch: myFetchImplementation,
});
```

## Effect

The `effect` entrypoint exposes every operation as an `Effect`. It requires `effect` as a peer dependency.

```ts
import { Effect } from "effect";
import { ApiService, makeApiLayer } from "vercel-api-js/effect";

const program = ApiService.accessGroups.listAccessGroups({});

await Effect.runPromise(
  program.pipe(Effect.provide(makeApiLayer({ token: process.env.VERCEL_TOKEN })))
);
```

Errors are typed as `ApiError`, `NetworkError` and `ValidationError`.

## Entrypoints

| Import | Contents |
| --- | --- |
| `vercel-api-js` | client class, operations, schemas and types |
| `vercel-api-js/components` | operations grouped by tag and by path |
| `vercel-api-js/schemas` | Zod schemas for every operation |
| `vercel-api-js/types` | TypeScript types for every operation |
| `vercel-api-js/effect` | Effect bindings |

## License

ISC
