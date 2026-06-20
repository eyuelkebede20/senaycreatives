import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "New post", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <main className="flex-1">
      <Container className="py-10">
        <Link href="/admin/blog" className="text-sm text-muted hover:text-ink">
          ← All posts
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">New post</h1>
        <div className="mt-8">
          <PostEditor />
        </div>
      </Container>
    </main>
  );
}
