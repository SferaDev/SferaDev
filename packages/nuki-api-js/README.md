# nuki-api-js

Auto-generated, fully typed client for the [Nuki Web API](https://developer.nuki.io/page/nuki-web-api/).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation
- **Effect support** - optional [Effect](https://effect.website) bindings via `nuki-api-js/effect`

## Installation

```bash
npm install nuki-api-js
```

## Quick Start

```ts
import { NukiApi } from "nuki-api-js";

const client = new NukiApi({ token: process.env.NUKI_TOKEN ?? null });

const accounts = await client.api.account.getAccountsResource({});
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new NukiApi({
  token: process.env.NUKI_TOKEN ?? null,
  fetch: myFetchImplementation,
});
```

## Effect

The `effect` entrypoint exposes every operation as an `Effect`. It requires `effect` as a peer dependency.

```ts
import { Effect } from "effect";
import { ApiService, makeApiLayer } from "nuki-api-js/effect";

const program = ApiService.account.getAccountsResource({});

await Effect.runPromise(
  program.pipe(Effect.provide(makeApiLayer({ token: process.env.NUKI_TOKEN })))
);
```

Errors are typed as `ApiError`, `NetworkError` and `ValidationError`.

## Entrypoints

| Import | Contents |
| --- | --- |
| `nuki-api-js` | client class, operations, schemas and types |
| `nuki-api-js/components` | operations grouped by tag and by path |
| `nuki-api-js/schemas` | Zod schemas for every operation |
| `nuki-api-js/types` | TypeScript types for every operation |
| `nuki-api-js/effect` | Effect bindings |

## License

ISC
