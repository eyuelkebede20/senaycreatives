import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { adminListPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d) : "—";
}

export default async function AdminBlogPage() {
  const all = await adminListPosts();

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Blog posts</h1>
            <p className="mt-1 text-sm text-muted">Write about your products, work, and ideas.</p>
          </div>
          <Link href="/admin/blog/new" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand">
            + New post
          </Link>
        </div>

        {all.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-line bg-paper-dim px-6 py-12 text-center text-muted">
            No posts yet. Write your first one.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-paper-dim text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {all.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3">
                      <span className={p.status === "published" ? "text-success" : "text-muted"}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(p.publishedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(p.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/blog/${p.id}/edit`} className="text-brand hover:underline">
                        Edit
                      </Link>
                      {p.status === "published" && (
                        <Link href={`/blog/${p.slug}`} target="_blank" className="ml-3 text-muted hover:text-ink">
                          View ↗
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </main>
  );
}
