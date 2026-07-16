// content/rate-card.ts — deliverable types and their credit price (idea.md §2.1).
// 1 credit ≈ 2 standardized labor-hours of Pro work incl. QA overhead.
// PLACEHOLDER prices until measured from real work_events timings, then repriced
// quarterly from ledger data. Seed as DATA, not code, so it's a one-line edit.
import type { Guild } from "@/db/schema";

export type Deliverable = { key: string; label: string; guild: Guild; credits: number };

export const RATE_CARD: Deliverable[] = [
  { key: "social_graphic", label: "Social graphic", guild: "design", credits: 1 },
  { key: "flyer", label: "Flyer", guild: "design", credits: 1 },
  { key: "carousel", label: "Carousel (multi-slide)", guild: "design", credits: 2 },
  { key: "short_edit", label: "Short-form edit", guild: "editing", credits: 3 },
  { key: "long_edit", label: "Long-form edit", guild: "editing", credits: 6 },
  { key: "content_calendar", label: "Content calendar (month)", guild: "content", credits: 4 },
  { key: "copywriting", label: "Copywriting (piece)", guild: "content", credits: 1 },
  { key: "shoot_half_day", label: "Shoot — half day", guild: "video", credits: 8 },
  { key: "smm_month", label: "SMM management (month)", guild: "smm", credits: 4 },
];

export const deliverableByKey = (key: string) => RATE_CARD.find((d) => d.key === key) ?? null;
