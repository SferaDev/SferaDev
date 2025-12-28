import { routes, type VercelConfig } from "@vercel/config/v1";

const branch = process.env.VERCEL_GIT_COMMIT_REF;
const isPreview = process.env.VERCEL_ENV === "preview" && branch;

const docsHost = isPreview
  ? `sferadev-${branch}.mintlify.app`
  : "sferadev.mintlify.dev";

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite("/docs", `https://${docsHost}`),
    routes.rewrite("/docs/:path*", `https://${docsHost}/:path*`),
    routes.rewrite("/_mintlify/:path*", `https://${docsHost}/_mintlify/:path*`),
    routes.rewrite("/api/request", `https://${docsHost}/_mintlify/api/request`),
    routes.rewrite("/docs/llms.txt", `https://${docsHost}/llms.txt`),
    routes.rewrite("/docs/llms-full.txt", `https://${docsHost}/llms-full.txt`),
    routes.rewrite("/docs/sitemap.xml", `https://${docsHost}/sitemap.xml`),
    routes.rewrite("/docs/robots.txt", `https://${docsHost}/robots.txt`),
    routes.rewrite("/docs/mcp", `https://${docsHost}/mcp`),
    routes.rewrite("/mintlify-assets/:path+", `https://${docsHost}/mintlify-assets/:path+`),
  ],
};
