import type { VercelConfig } from "@vercel/config/v1";

const isPreview = process.env.VERCEL_ENV === "preview";
const branch = process.env.VERCEL_GIT_COMMIT_REF;

const docsBaseUrl =
  isPreview && branch
    ? `https://sferadev-${branch}.mintlify.app`
    : "https://sferadev.mintlify.dev";

export const config: VercelConfig = {
  rewrites: [
    {
      source: "/docs",
      destination: `${docsBaseUrl}/docs`,
    },
    {
      source: "/docs/:match*",
      destination: `${docsBaseUrl}/docs/:match*`,
    },
  ],
};
