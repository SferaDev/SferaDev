---
"keycloak-api": patch
---

Republish so the shipped bundle matches the generated sources.

The `keycloak-api@1.0.0` artifact on npm was built from pre-kubb-5 sources, where the
self-referential admin schemas were emitted as eager property values instead of lazy getters.
`policyRepresentationSchema.scopesData` calls `z.array(scopeRepresentationSchema)` while that
`const` is still in its temporal dead zone, so merely importing the package throws:

```
ReferenceError: Cannot access 'scopeRepresentationSchema' before initialization
```

That kills every consumer at import time — including anyone using only the account API, since
`KeycloakAccountApi` lives in the same entry point. `src/admin/generated/schemas.ts` in this repo
already emits `get scopesData()`, so a build from current `main` imports cleanly; only the
published artifact is broken.
