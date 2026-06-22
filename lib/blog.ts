import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { marked } from "marked";
import { db } from "@/lib/db";
import { posts, users, type Post } from "@/db/schema";
import type { Locale } from "@/content/i18n";

// Public list shape (no full content — keep list payloads small).
export type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  titleAm: string | null;
  excerptAm: string | null;
  cover: string | null;
  publishedAt: Date | null;
};

const CARD = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  titleAm: posts.titleAm,
  excerptAm: posts.excerptAm,
  cover: posts.cover,
  publishedAt: posts.publishedAt,
};

// ── Localisation helpers (fall back to English when Amharic is missing) ─────
export function cardTitle(c: PostCard, locale: Locale): string {
  return locale === "am" && c.titleAm ? c.titleAm : c.title;
}
export function cardExcerpt(c: PostCard, locale: Locale): string | null {
  return locale === "am" && c.excerptAm ? c.excerptAm : c.excerpt;
}
/** Pick the localized title/excerpt/content for a full post. */
export function localizePost(post: Post, locale: Locale) {
  const am = locale === "am";
  return {
    title: am && post.titleAm ? post.titleAm : post.title,
    excerpt: am && post.excerptAm ? post.excerptAm : post.excerpt,
    content: am && post.contentAm ? post.contentAm : post.content,
  };
}

/** Turn a title into a URL-safe slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Render trusted (admin-authored) Markdown to HTML. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/** Escape LIKE wildcards so a user's query is treated literally. */
function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Published posts, newest first. */
export async function listPublishedPosts(): Promise<PostCard[]> {
  return db().select(CARD).from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt));
}

/** Published posts matching a search term (title / excerpt / content). */
export async function searchPublishedPosts(q: string): Promise<PostCard[]> {
  const term = `%${escapeLike(q.trim())}%`;
  return db()
    .select(CARD)
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        or(
          ilike(posts.title, term),
          ilike(posts.excerpt, term),
          ilike(posts.content, term),
          ilike(posts.titleAm, term),
          ilike(posts.excerptAm, term),
          ilike(posts.contentAm, term),
        ),
      ),
    )
    .orderBy(desc(posts.publishedAt));
}

/** A single published post by slug, with author name. */
export async function getPublishedPost(slug: string) {
  const [row] = await db()
    .select({ post: posts, authorName: users.name })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  return row ?? null;
}

/** All published slugs (for sitemap / static params). */
export async function publishedSlugs(): Promise<string[]> {
  const rows = await db().select({ slug: posts.slug }).from(posts).where(eq(posts.status, "published"));
  return rows.map((r) => r.slug);
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function adminListPosts() {
  return db()
    .select({ id: posts.id, slug: posts.slug, title: posts.title, status: posts.status, updatedAt: posts.updatedAt, publishedAt: posts.publishedAt })
    .from(posts)
    .orderBy(desc(posts.updatedAt));
}

export async function adminGetPost(id: string): Promise<Post | null> {
  const [row] = await db().select().from(posts).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}
