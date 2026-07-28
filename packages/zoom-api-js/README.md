# zoom-api-js

Auto-generated, fully typed client for the [Zoom API](https://developers.zoom.us/docs/api/).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation
- **Effect support** - optional [Effect](https://effect.website) bindings via `zoom-api-js/effect`

## Installation

```bash
npm install zoom-api-js
```

## Quick Start

```ts
import { ZoomApi } from "zoom-api-js";

const client = new ZoomApi({ token: process.env.ZOOM_TOKEN ?? null });

const files = await client.api.archiving.listArchivedFiles({});
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new ZoomApi({
  token: process.env.ZOOM_TOKEN ?? null,
  fetch: myFetchImplementation,
});
```

## Effect

The `effect` entrypoint exposes every operation as an `Effect`. It requires `effect` as a peer dependency.

```ts
import { Effect } from "effect";
import { ApiService, makeApiLayer } from "zoom-api-js/effect";

const program = ApiService.archiving.listArchivedFiles({});

await Effect.runPromise(
  program.pipe(Effect.provide(makeApiLayer({ token: process.env.ZOOM_TOKEN })))
);
```

Errors are typed as `ApiError`, `NetworkError` and `ValidationError`.

## Entrypoints

| Import | Contents |
| --- | --- |
| `zoom-api-js` | client class, operations, schemas and types |
| `zoom-api-js/components` | operations grouped by tag and by path |
| `zoom-api-js/schemas` | Zod schemas for every operation |
| `zoom-api-js/types` | TypeScript types for every operation |
| `zoom-api-js/effect` | Effect bindings |

## License

ISC
