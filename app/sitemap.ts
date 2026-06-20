import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/content/projects";
import { publishedSlugs } from "@/lib/blog";

// Static routes + project case studies + published blog posts.
// Dynamic so it isn't generated at build (no DB needed then); guarded below too.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/packages", "/projects", "/partners", "/team", "/blog", "/careers", "/start-a-project", "/privacy"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Blog posts — guarded so a DB hiccup at build can't break the sitemap.
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await publishedSlugs();
    blogEntries = slugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // DB unavailable (e.g. at build time) — ship the rest of the sitemap.
  }

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
