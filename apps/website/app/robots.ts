import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/" }],
		// `/docs` is a rewrite to the Mintlify-hosted docs, which publish their own
		// sitemap; advertise both so crawlers discover the whole site.
		sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/docs/sitemap.xml")],
	};
}
