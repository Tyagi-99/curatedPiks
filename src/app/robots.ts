import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /go/* are affiliate redirects: crawling them wastes budget and files a
      // click row per crawl. /api/* has nothing indexable.
      disallow: ["/admin", "/api/", "/go/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
