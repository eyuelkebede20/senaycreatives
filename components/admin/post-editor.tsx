"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { createPost, updatePost, deletePost, type PostInput } from "@/app/admin/blog/actions";

type Existing = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  content: string;
  status: "draft" | "published";
};

export function PostEditor({ post }: { post?: Existing }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: PostInput = {
      title: String(fd.get("title") ?? ""),
      slug: String(fd.get("slug") ?? ""),
      excerpt: String(fd.get("excerpt") ?? ""),
      cover: String(fd.get("cover") ?? ""),
      content: String(fd.get("content") ?? ""),
      status: (String(fd.get("status") ?? "draft") as "draft" | "published"),
    };
    setError(null);
    startTransition(async () => {
      const res = post ? await updatePost(post.id, input) : await createPost(input);
      if (res.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function onDelete() {
    if (!post || !confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (res.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <Field label="Title" htmlFor="p-title" required>
        <Input id="p-title" name="title" defaultValue={post?.title} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" htmlFor="p-slug" hint="Leave blank to auto-generate from the title.">
          <Input id="p-slug" name="slug" defaultValue={post?.slug} placeholder="my-post-title" />
        </Field>
        <Field label="Status" htmlFor="p-status" required>
          <Select id="p-status" name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
      </div>
      <Field label="Excerpt" htmlFor="p-excerpt" hint="Short summary shown on the blog index and in search results.">
        <Textarea id="p-excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} className="min-h-20" />
      </Field>
      <Field label="Cover image URL" htmlFor="p-cover" hint="Optional. A /blog/… path under /public or a full URL.">
        <Input id="p-cover" name="cover" defaultValue={post?.cover ?? ""} placeholder="/blog/my-cover.jpg" />
      </Field>
      <Field label="Content (Markdown)" htmlFor="p-content" required hint="Supports Markdown: # headings, **bold**, links, lists, etc.">
        <Textarea id="p-content" name="content" defaultValue={post?.content} className="min-h-80 font-mono text-sm" />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        {post ? (
          <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-danger hover:underline disabled:opacity-50">
            Delete post
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push("/admin/blog")} className="text-sm text-muted hover:text-ink">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand disabled:opacity-50">
            {pending ? "Saving…" : post ? "Save changes" : "Create post"}
          </button>
        </div>
      </div>
    </form>
  );
}
