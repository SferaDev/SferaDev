import type { VercelConfig } from "@vercel/config/v1";

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "main";
const isProduction = process.env.VERCEL_ENV === "production" || branch === "main";

const docsHost = isProduction
  ? "sferadev.mintlify.dev"
  : `sferadev-${branch}.mintlify.app`;

export const config: VercelConfig = {
  rewrites: [
    {
      source: "/docs",
      destination: `https://${docsHost}/docs`,
    },
    {
      source: "/docs/:match*",
      destination: `https://${docsHost}/docs/:match*`,
    },
  ],
};
