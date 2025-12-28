import { routes, type VercelConfig } from "@vercel/config/v1";

const branch = process.env.VERCEL_GIT_COMMIT_REF;
const isPreview = process.env.VERCEL_ENV === "preview" && branch;

const docsHost = isPreview
  ? `sferadev-${branch}.mintlify.app`
  : "sferadev.mintlify.dev";

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite("/docs", `https://${docsHost}`),
    routes.rewrite("/docs/:match*", `https://${docsHost}/:match*`),
  ],
};
