import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { listPublishedPosts, searchPublishedPosts, type PostCard } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideas, product notes, and lessons from the SenayCreatives team on web, apps, and digital growth.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog · SenayCreatives",
    description: "Ideas and product notes from the SenayCreatives team.",
    url: "/blog",
  },
};

export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(d) : "";
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const items: PostCard[] = query ? await searchPublishedPosts(query) : await listPublishedPosts();

  return (
    <main className="flex-1">
      <Section className="pb-0">
        <SectionHeading eyebrow="Blog" title="Ideas & product notes." intro="What we're building, learning, and thinking about." />

        {/* Search — server-side GET, no JS required */}
        <form action="/blog" method="get" className="mt-8 flex max-w-md gap-2" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search posts…"
            aria-label="Search blog posts"
            className="w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <button type="submit" className="rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-brand">
            Search
          </button>
        </form>

        {query && (
          <p className="mt-4 text-sm text-muted">
            {items.length} result{items.length === 1 ? "" : "s"} for “{query}”.{" "}
            <Link href="/blog" className="text-brand hover:underline">Clear</Link>
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-line bg-paper-dim px-6 py-12 text-center text-muted">
            {query ? "No posts match your search." : "No posts yet — check back soon."}
          </p>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <article key={p.id} className="flex flex-col">
                <Link href={`/blog/${p.slug}`} className="group flex flex-1 flex-col">
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-dim">
                    {p.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt={p.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold group-hover:text-brand">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 flex-1 text-sm text-ink-soft">{p.excerpt}</p>}
                  <p className="mt-3 text-xs text-muted">{fmt(p.publishedAt)}</p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>
      <div className="py-16" />
    </main>
  );
}
