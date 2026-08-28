---
"cloudflare-api-js": minor
"keycloak-api": minor
"zoom-api-js": minor
---

Refreshed the generated clients against the current upstream OpenAPI specs.

The kubb v5 migration required regenerating every client, which also picked up spec changes that
had accumulated since each was last generated:

- **cloudflare-api-js** — last generated 2026-02-19, so this is six months of drift: **1022
  operations added and 209 removed**. `[BREAKING]` for anyone calling one of the removed
  operations; they no longer exist in Cloudflare's published schema.
- **keycloak-api** — 12 operations added, none removed.
- **zoom-api-js** — 2 operations added, none removed.
