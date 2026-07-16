// content/guilds.ts — the guild taxonomy (idea.md §1.2) and how a careers role
// maps onto a guild when an applicant is hired into the collective.
import type { Guild } from "@/db/schema";

export const GUILDS: { slug: Guild; label: string; blurb: string }[] = [
  { slug: "video", label: "Video", blurb: "Shoots, motion, direction" },
  { slug: "editing", label: "Editing", blurb: "Short- and long-form edits" },
  { slug: "design", label: "Design", blurb: "Graphics, brand, layout" },
  { slug: "content", label: "Content", blurb: "Copy, calendars, scripts" },
  { slug: "smm", label: "Social Media", blurb: "Account leads, community, strategy" },
];

export const GUILD_LABEL = Object.fromEntries(GUILDS.map((g) => [g.slug, g.label])) as Record<Guild, string>;

// Best-effort map from a careers role slug → guild, used to pre-fill the guild
// when hiring an applicant (the manager can override at hire time). Covers both
// the current placeholder roles and the guild-native slugs (MAPA §8.A6).
export const ROLE_TO_GUILD: Record<string, Guild> = {
  "frontend-engineer": "design",
  "product-designer": "design",
  "digital-marketer": "smm",
  videographer: "video",
  editor: "editing",
  designer: "design",
  "content-creator": "content",
  "social-media-manager": "smm",
};

export function guildForRole(roleSlug: string): Guild | null {
  return ROLE_TO_GUILD[roleSlug] ?? null;
}
