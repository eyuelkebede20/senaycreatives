import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { marked } from "marked";
import { db } from "@/lib/db";
import { posts, users, type Post } from "@/db/schema";

// Public list shape (no full content — keep list payloads small).
export type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  publishedAt: Date | null;
};

const CARD = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  cover: posts.cover,
  publishedAt: posts.publishedAt,
};

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
        or(ilike(posts.title, term), ilike(posts.excerpt, term), ilike(posts.content, term)),
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
