# Hi, I'm Alexis

Principal Software Engineer at [Xata](https://xata.io), working on serverless Postgres. On my own time I build [PgBeam](https://pgbeam.com): Postgres access that AI agents can be trusted with.

I write TypeScript and Go, mostly APIs, SDKs and the tooling around databases.

## PgBeam

Agents usually get a superuser connection string. PgBeam gives them a scoped one instead: read-only access, table allowlists, PII masking and a full audit trail, all enforced in the wire protocol rather than in the prompt.

Everything a user touches is open source, under [sferarc](https://github.com/sferarc):

| Piece | Where |
| --- | --- |
| SDKs | [TypeScript](https://github.com/sferarc/pgbeam-js), [Go](https://github.com/sferarc/pgbeam-go), [Python](https://github.com/sferarc/pgbeam-python) |
| CLI | [pgbeam-cli](https://github.com/sferarc/pgbeam-cli), `brew install sferarc/pgbeam/pgbeam` |
| Infrastructure as code | [Terraform](https://github.com/sferarc/terraform-provider-pgbeam), [Pulumi](https://github.com/sferarc/pgbeam-pulumi), [Crossplane](https://github.com/sferarc/pgbeam-crossplane) |
| For agents | [pgbeam-agent](https://github.com/sferarc/pgbeam-agent): installable skills and plugin |
| Go libraries | [pgscram](https://github.com/sferarc/pgscram), [auditchain](https://github.com/sferarc/auditchain), [promptscan](https://github.com/sferarc/promptscan), [schemadigest](https://github.com/sferarc/schemadigest) |

## Open source I maintain

| Package | What it does | Downloads |
| --- | --- | --- |
| [`@xata.io/api`](https://www.npmjs.com/package/@xata.io/api) | Client for the Xata API | ![npm downloads](https://img.shields.io/npm/dm/@xata.io/api?style=flat-square&label=) |
| [`@xata.io/pgroll`](https://www.npmjs.com/package/@xata.io/pgroll) | TypeScript definitions and validation for pgroll migrations | ![npm downloads](https://img.shields.io/npm/dm/@xata.io/pgroll?style=flat-square&label=) |
| [`vercel-api-js`](https://www.npmjs.com/package/vercel-api-js) | Type-safe Vercel API client, regenerated daily from the spec | ![npm downloads](https://img.shields.io/npm/dm/vercel-api-js?style=flat-square&label=) |
| [`keycloak-api`](https://www.npmjs.com/package/keycloak-api) | Type-safe Keycloak API client | ![npm downloads](https://img.shields.io/npm/dm/keycloak-api?style=flat-square&label=) |

The Vercel, Keycloak, Zoom, Netlify and LiteLLM clients come from one generator in [sferarc/openapi](https://github.com/sferarc/openapi). [ai-gateway-proxy](https://github.com/sferarc/ai-gateway-proxy) and [vscode-ai-gateway](https://github.com/sferarc/vscode-ai-gateway) put the Vercel AI Gateway behind an OpenAI-compatible endpoint and into VS Code chat.

I also send fixes upstream to the projects I depend on, lately [Keycloak](https://github.com/keycloak/keycloak) and [Better Auth](https://github.com/better-auth/better-auth).

## Elsewhere

[sferadev.com](https://sferadev.com) · [npm](https://www.npmjs.com/~sferadev) · [sferarc](https://github.com/sferarc)
