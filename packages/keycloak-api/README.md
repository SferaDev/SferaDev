# keycloak-api

Auto-generated, fully typed client for the [Keycloak Admin and Account REST APIs](https://www.keycloak.org/docs-api/latest/rest-api/index.html).

## Features

- **Fully typed** - every endpoint, parameter and response is generated from the official OpenAPI specs
- **Admin and Account APIs** - separate clients for the two Keycloak surfaces
- **Tree-shakable** - only the operations you import end up in your bundle
- **Runtime agnostic** - uses the global `fetch`, or bring your own implementation

## Installation

```bash
npm install keycloak-api
```

## Quick Start

Keycloak is self-hosted, so both clients require the `baseUrl` of your server. Endpoints are addressed
as `"<METHOD> <path>"`.

### Admin API

```ts
import { KeycloakAdminApi } from "keycloak-api";

const admin = new KeycloakAdminApi({
  baseUrl: "https://keycloak.example.com",
  token: process.env.KEYCLOAK_TOKEN ?? null,
});

const realms = await admin.request("GET /admin/realms", {});
const realm = await admin.request("GET /admin/realms/{realm}", {
  pathParams: { realm: "master" },
});
```

### Account API

The Account API is scoped to a single realm, passed at construction time.

```ts
import { KeycloakAccountApi } from "keycloak-api";

const account = new KeycloakAccountApi({
  baseUrl: "https://keycloak.example.com",
  realm: "master",
  token: process.env.KEYCLOAK_TOKEN ?? null,
});

const me = await account.request("GET /account/", {});
```

### Custom fetch

```ts
const admin = new KeycloakAdminApi({
  baseUrl: "https://keycloak.example.com",
  token: process.env.KEYCLOAK_TOKEN ?? null,
  fetch: myFetchImplementation,
});
```

## Entrypoints

| Import | Contents |
| --- | --- |
| `keycloak-api` | both client classes, plus admin/account operations, schemas and types |
| `keycloak-api/admin/components` | admin operations grouped by tag and by path |
| `keycloak-api/admin/schemas` | Zod schemas for admin operations |
| `keycloak-api/admin/types` | TypeScript types for admin operations |
| `keycloak-api/account/components` | account operations grouped by tag and by path |
| `keycloak-api/account/schemas` | Zod schemas for account operations |
| `keycloak-api/account/types` | TypeScript types for account operations |

## License

ISC
