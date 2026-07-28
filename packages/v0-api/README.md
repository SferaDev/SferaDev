# v0-api

Auto-generated, fully typed client for the [Vercel v0 API](https://v0.dev/docs/api).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation
- **Effect support** - optional [Effect](https://effect.website) bindings via `v0-api/effect`

## Installation

```bash
npm install v0-api
```

## Quick Start

```ts
import { V0Api } from "v0-api";

const client = new V0Api({ token: process.env.V0_API_KEY ?? null });

const chats = await client.api.chats.chatsFind();
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new V0Api({
  token: process.env.V0_API_KEY ?? null,
  fetch: myFetchImplementation,
});
```

## Effect

The `effect` entrypoint exposes every operation as an `Effect`. It requires `effect` as a peer dependency.

```ts
import { Effect } from "effect";
import { ApiService, makeApiLayer } from "v0-api/effect";

const program = ApiService.chats.chatsFind({});

await Effect.runPromise(
  program.pipe(Effect.provide(makeApiLayer({ token: process.env.V0_API_KEY })))
);
```

Errors are typed as `ApiError`, `NetworkError` and `ValidationError`.

## Entrypoints

| Import | Contents |
| --- | --- |
| `v0-api` | client class, operations, schemas and types |
| `v0-api/components` | operations grouped by tag and by path |
| `v0-api/schemas` | Zod schemas for every operation |
| `v0-api/types` | TypeScript types for every operation |
| `v0-api/effect` | Effect bindings |

## License

ISC
