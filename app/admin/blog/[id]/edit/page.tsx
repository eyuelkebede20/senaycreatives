import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PostEditor } from "@/components/admin/post-editor";
import { adminGetPost } from "@/lib/blog";

export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  return (
    <main className="flex-1">
      <Container className="py-10">
        <Link href="/admin/blog" className="text-sm text-muted hover:text-ink">
          ← All posts
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">Edit post</h1>
        <div className="mt-8">
          <PostEditor
            post={{
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              cover: post.cover,
              content: post.content,
              status: post.status,
            }}
          />
        </div>
      </Container>
    </main>
  );
}
