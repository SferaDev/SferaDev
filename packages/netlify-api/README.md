# netlify-api

Auto-generated, fully typed client for the [Netlify API](https://docs.netlify.com/api/get-started/).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation
- **Effect support** - optional [Effect](https://effect.website) bindings via `netlify-api/effect`

## Installation

```bash
npm install netlify-api
```

## Quick Start

```ts
import { NetlifyApi } from "netlify-api";

const client = new NetlifyApi({ token: process.env.NETLIFY_TOKEN ?? "" });

const sites = await client.api.site.listSites({});
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Options

```ts
const client = new NetlifyApi({
  token: process.env.NETLIFY_TOKEN ?? "",
  basePath: "https://api.netlify.com/api/v1", // optional override
  fetch: myFetchImplementation, // optional
});
```

## Effect

The `effect` entrypoint exposes every operation as an `Effect`. It requires `effect` as a peer dependency.

```ts
import { Effect } from "effect";
import { ApiService, makeApiLayer } from "netlify-api/effect";

const program = ApiService.site.listSites({});

await Effect.runPromise(
  program.pipe(Effect.provide(makeApiLayer({ token: process.env.NETLIFY_TOKEN })))
);
```

Errors are typed as `ApiError`, `NetworkError` and `ValidationError`.

## Entrypoints

| Import | Contents |
| --- | --- |
| `netlify-api` | client class, operations, schemas and types |
| `netlify-api/components` | operations grouped by tag and by path |
| `netlify-api/schemas` | Zod schemas for every operation |
| `netlify-api/types` | TypeScript types for every operation |
| `netlify-api/effect` | Effect bindings |

## License

ISC
