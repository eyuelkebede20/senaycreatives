import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/content/projects";

// Generated sitemap. Static routes + one entry per project case study.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/packages", "/projects", "/partners", "/team", "/careers", "/start-a-project"];

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

  return [...staticEntries, ...projectEntries];
}
