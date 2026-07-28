# cloudflare-api-js

Auto-generated, fully typed client for the [Cloudflare API](https://developers.cloudflare.com/api/).

## Features

- **Fully typed** - every operation, parameter and response is generated from the official OpenAPI spec
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation

## Installation

```bash
npm install cloudflare-api-js
```

## Quick Start

```ts
import { CloudflareApi } from "cloudflare-api-js";

const client = new CloudflareApi({ token: process.env.CLOUDFLARE_TOKEN ?? "" });

const accounts = await client.api.accounts.accountsListAccounts({});
```

Operations are grouped by tag: `client.api.<tag>.<operation>(params)`.

### Custom fetch

```ts
const client = new CloudflareApi({
  token: process.env.CLOUDFLARE_TOKEN ?? "",
  fetch: myFetchImplementation,
});
```

## Entrypoints

| Import | Contents |
| --- | --- |
| `cloudflare-api-js` | client class, operations and types |
| `cloudflare-api-js/components` | operations grouped by tag and by path |
| `cloudflare-api-js/types` | TypeScript types for every operation |

## License

ISC
