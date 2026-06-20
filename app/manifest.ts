import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Web app manifest — minor SEO/polish signal and nicer add-to-homescreen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f3ee", // --color-paper
    theme_color: "#1f4dff", // --color-brand
    icons: [{ src: "/logo-mark.png", sizes: "512x512", type: "image/png" }],
  };
}
