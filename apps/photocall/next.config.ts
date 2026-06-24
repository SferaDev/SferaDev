import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
	reactStrictMode: true,
	experimental: {
		// Single-photo captures POST their JPEG data URL to the `saveCapture`
		// server action; a high-res (up to 4K) frame base64-encodes well past the
		// 1 MB default and would 413. Raise the ceiling so captures never fail.
		// (Strips upload their composite via a presigned R2 PUT, not a server
		// action, so only the single-photo path needs this headroom.)
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default withNextIntl(nextConfig);
