"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/blog";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const postSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(180),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  content: z.string().trim().min(1, "Content is required"),
  // Optional Amharic versions.
  titleAm: z.string().trim().max(180).optional().or(z.literal("")),
  excerptAm: z.string().trim().max(300).optional().or(z.literal("")),
  contentAm: z.string().trim().optional().or(z.literal("")),
  cover: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

export type PostInput = z.infer<typeof postSchema>;

/** Ensure the slug is unique, ignoring `exceptId` (for updates). */
async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base) || "post";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const where = exceptId
      ? and(eq(posts.slug, candidate), ne(posts.id, exceptId))
      : eq(posts.slug, candidate);
    const [hit] = await db().select({ id: posts.id }).from(posts).where(where).limit(1);
    if (!hit) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export async function createPost(input: PostInput): Promise<Result<{ id: string }>> {
  const user = await requireUser();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;
  try {
    const slug = await uniqueSlug(d.slug || d.title);
    const [row] = await db()
      .insert(posts)
      .values({
        slug,
        title: d.title,
        excerpt: d.excerpt || null,
        content: d.content,
        titleAm: d.titleAm || null,
        excerptAm: d.excerptAm || null,
        contentAm: d.contentAm || null,
        cover: d.cover || null,
        status: d.status,
        publishedAt: d.status === "published" ? new Date() : null,
        authorId: user.id,
      })
      .returning({ id: posts.id });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("createPost failed:", err);
    return { ok: false, error: "Couldn't save the post." };
  }
}

export async function updatePost(id: string, input: PostInput): Promise<Result> {
  await requireUser();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;
  try {
    const [existing] = await db().select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!existing) return { ok: false, error: "Post not found." };
    const slug = await uniqueSlug(d.slug || d.title, id);
    // Stamp publishedAt the first time it goes live; keep it thereafter.
    const publishedAt =
      d.status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
    await db()
      .update(posts)
      .set({
        slug,
        title: d.title,
        excerpt: d.excerpt || null,
        content: d.content,
        titleAm: d.titleAm || null,
        excerptAm: d.excerptAm || null,
        contentAm: d.contentAm || null,
        cover: d.cover || null,
        status: d.status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return { ok: true };
  } catch (err) {
    console.error("updatePost failed:", err);
    return { ok: false, error: "Couldn't save the post." };
  }
}

export async function deletePost(id: string): Promise<Result> {
  await requireUser();
  try {
    await db().delete(posts).where(eq(posts.id, id));
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { ok: true };
  } catch (err) {
    console.error("deletePost failed:", err);
    return { ok: false, error: "Couldn't delete the post." };
  }
}
