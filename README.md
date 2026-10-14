# Alexis Rico

Principal Software Engineer at [Xata](https://xata.io). I also build [PgBeam](https://pgbeam.com) and maintain open source.

**45+ npm packages · 330K+ monthly downloads · 20 open source repos · TypeScript and Go**

---

## Day to day: Xata

Principal Software Engineer at [Xata](https://xata.io), the serverless Postgres platform.

- Lead TypeScript technical decisions and design cross-team features with the backend team.
- Build the platform's authentication and authorization: sessions, role-based access control and fine-grained API key permissions.
- Build the platform's AI features, from agents that work on a database to the tooling that lets them reach it safely.
- Built an edge query endpoint on Cloudflare that caches and routes global requests to cut latency.

Earlier at Xata: main developer of the TypeScript SDK, the in-browser playground, Xata Workers and the CLI.

---

## Side project: PgBeam

Agents usually get a superuser connection string. [PgBeam](https://pgbeam.com) gives them a scoped one instead: read-only access, table allowlists, PII masking and a full audit trail, all enforced in the wire protocol rather than in the prompt.

| Piece | Where |
| --- | --- |
| SDKs | [TypeScript](https://github.com/sferarc/pgbeam-js), [Go](https://github.com/sferarc/pgbeam-go), [Python](https://github.com/sferarc/pgbeam-python) |
| CLI | [pgbeam-cli](https://github.com/sferarc/pgbeam-cli), `brew install sferarc/pgbeam/pgbeam` |
| Infrastructure as code | [Terraform](https://github.com/sferarc/terraform-provider-pgbeam), [Pulumi](https://github.com/sferarc/pgbeam-pulumi), [Crossplane](https://github.com/sferarc/pgbeam-crossplane) |
| For agents | [pgbeam-agent](https://github.com/sferarc/pgbeam-agent): installable skills and plugin |
| Go libraries | [pgscram](https://github.com/sferarc/pgscram), [auditchain](https://github.com/sferarc/auditchain), [promptscan](https://github.com/sferarc/promptscan), [schemadigest](https://github.com/sferarc/schemadigest) |

---

## Open source

| Package | What it does | Downloads |
| --- | --- | --- |
| [`@xata.io/api`](https://www.npmjs.com/package/@xata.io/api) | Client for the Xata API | ![npm downloads](https://img.shields.io/npm/dm/@xata.io/api?style=flat-square&label=) |
| [`@xata.io/pgroll`](https://www.npmjs.com/package/@xata.io/pgroll) | TypeScript definitions and validation for pgroll migrations | ![npm downloads](https://img.shields.io/npm/dm/@xata.io/pgroll?style=flat-square&label=) |
| [`vercel-api-js`](https://www.npmjs.com/package/vercel-api-js) | Type-safe Vercel API client, regenerated daily from the spec | ![npm downloads](https://img.shields.io/npm/dm/vercel-api-js?style=flat-square&label=) |
| [`keycloak-api`](https://www.npmjs.com/package/keycloak-api) | Type-safe Keycloak API client | ![npm downloads](https://img.shields.io/npm/dm/keycloak-api?style=flat-square&label=) |

The Vercel, Keycloak, Zoom, Netlify and LiteLLM clients come from one generator in [sferarc/openapi](https://github.com/sferarc/openapi). [ai-gateway-proxy](https://github.com/sferarc/ai-gateway-proxy) and [vscode-ai-gateway](https://github.com/sferarc/vscode-ai-gateway) put the Vercel AI Gateway behind an OpenAI-compatible endpoint and into VS Code chat.

I send fixes upstream to [Keycloak](https://github.com/keycloak/keycloak) and [Better Auth](https://github.com/better-auth/better-auth), and was a core maintainer of the Paranoid Android custom ROM.

---

[sferadev.com](https://sferadev.com) · [npm](https://www.npmjs.com/~sferadev) · [sferarc](https://github.com/sferarc)
