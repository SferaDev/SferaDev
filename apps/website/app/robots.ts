import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		// The résumé stays served so a link shared directly still resolves, but it is
		// not linked from the site and should not be surfaced by search engines.
		rules: [{ userAgent: "*", allow: "/", disallow: "/resume.pdf" }],
		// `/docs` is a rewrite to the Mintlify-hosted docs, which publish their own
		// sitemap; advertise both so crawlers discover the whole site.
		sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/docs/sitemap.xml")],
	};
}
