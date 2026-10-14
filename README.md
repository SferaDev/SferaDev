# Alexis Rico

Principal Software Engineer at [Xata](https://xata.io). I also build [PgBeam](https://pgbeam.com) and maintain open source.

**18 npm packages · 25K+ monthly downloads · 20 open source repos · TypeScript and Go**

---

## Day to day: Xata

Principal Software Engineer at [Xata](https://xata.io), the serverless Postgres platform.

- Lead TypeScript technical decisions and design cross-team features with the backend team.
- Build the platform's authentication and authorization: sessions, role-based access control and fine-grained API key permissions.
- Build the platform's AI features, from agents that work on a database to the tooling that lets them reach it safely.

Earlier at Xata: main developer of the TypeScript SDK, the in-browser playground, Xata Workers and the CLI, and built an edge query endpoint on Cloudflare that caches and routes global requests to cut latency.

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
| [`vercel-api-js`](https://www.npmjs.com/package/vercel-api-js) | Type-safe Vercel API client, regenerated daily from the spec | ![npm downloads](https://img.shields.io/npm/dm/vercel-api-js?style=flat-square&label=) |
| [`v0-api`](https://www.npmjs.com/package/v0-api) | Type-safe client for the Vercel v0 API | ![npm downloads](https://img.shields.io/npm/dm/v0-api?style=flat-square&label=) |
| [`keycloak-api`](https://www.npmjs.com/package/keycloak-api) | Type-safe Keycloak API client | ![npm downloads](https://img.shields.io/npm/dm/keycloak-api?style=flat-square&label=) |
| [`zoom-api-js`](https://www.npmjs.com/package/zoom-api-js) | Type-safe Zoom API client | ![npm downloads](https://img.shields.io/npm/dm/zoom-api-js?style=flat-square&label=) |
| [`netlify-api`](https://www.npmjs.com/package/netlify-api) | Type-safe Netlify API client | ![npm downloads](https://img.shields.io/npm/dm/netlify-api?style=flat-square&label=) |
| [`litellm-api`](https://www.npmjs.com/package/litellm-api) | Type-safe LiteLLM API client | ![npm downloads](https://img.shields.io/npm/dm/litellm-api?style=flat-square&label=) |
| [`cloudflare-api-js`](https://www.npmjs.com/package/cloudflare-api-js) | Type-safe Cloudflare API client | ![npm downloads](https://img.shields.io/npm/dm/cloudflare-api-js?style=flat-square&label=) |
| [`nuki-api-js`](https://www.npmjs.com/package/nuki-api-js) | Type-safe Nuki API client | ![npm downloads](https://img.shields.io/npm/dm/nuki-api-js?style=flat-square&label=) |
| [`rollup-plugin-import-cdn`](https://www.npmjs.com/package/rollup-plugin-import-cdn) | Rollup plugin that resolves bare imports to CDN URLs | ![npm downloads](https://img.shields.io/npm/dm/rollup-plugin-import-cdn?style=flat-square&label=) |

The API clients come from one generator in [sferarc/openapi](https://github.com/sferarc/openapi). [ai-gateway-proxy](https://github.com/sferarc/ai-gateway-proxy) and [vscode-ai-gateway](https://github.com/sferarc/vscode-ai-gateway) put the Vercel AI Gateway behind an OpenAI-compatible endpoint and into VS Code chat.

I send fixes upstream to [Keycloak](https://github.com/keycloak/keycloak) and [Better Auth](https://github.com/better-auth/better-auth), and was a core maintainer of the Paranoid Android custom ROM.

---

[sferadev.com](https://sferadev.com) · [npm](https://www.npmjs.com/~sferadev) · [sferarc](https://github.com/sferarc)
