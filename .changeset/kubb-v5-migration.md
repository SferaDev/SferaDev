---
"cloudflare-api-js": minor
"keycloak-api": minor
"litellm-api": minor
"netlify-api": minor
"nuki-api-js": minor
"v0-api": minor
"vercel-api-js": minor
"zoom-api-js": minor
---

Migrated code generation to kubb v5.

The generated client functions are unchanged — same names, same signatures, same behaviour — so
calling code needs no updates. Auxiliary type exports were restructured by kubb v5: `*RequestConfig`
is now `*Options`, and per-parameter types are now grouped (`FooPathBarId` → `FooPath`,
`FooQueryLimit` → `FooQuery`). Only code importing those helper types directly is affected.
