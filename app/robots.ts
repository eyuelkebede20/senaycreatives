import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Public site is crawlable; the manager backend, auth, and API are not.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/login"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
