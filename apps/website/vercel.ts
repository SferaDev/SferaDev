import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  rewrites: [
    {
      source: "/docs",
      destination: "https://sferadev.mintlify.dev/docs",
    },
    {
      source: "/docs/:match*",
      destination: "https://sferadev.mintlify.dev/docs/:match*",
    },
  ],
};
