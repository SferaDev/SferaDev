---
"ai-gateway-proxy": minor
---

Add framework-agnostic support with `extractPath` and `segmentsParam` options

- `extractPath`: Custom function to extract the gateway path from the request URL, enabling use with Hono, Express, and other frameworks without catch-all route support
- `segmentsParam`: Customize the name of the catch-all parameter in Next.js routes (defaults to "segments")
- Context parameter is now optional when using `extractPath`
