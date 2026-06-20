import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CallToAction } from "@/components/sections/cta";
import { getPublishedPost, renderMarkdown } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const row = await getPublishedPost(slug);
  if (!row) return { title: "Post not found" };
  const desc = row.post.excerpt ?? `A post from the ${site.name} team.`;
  return {
    title: row.post.title,
    description: desc,
    alternates: { canonical: `/blog/${row.post.slug}` },
    openGraph: {
      type: "article",
      title: `${row.post.title} · ${site.name}`,
      description: desc,
      url: `/blog/${row.post.slug}`,
      ...(row.post.cover ? { images: [row.post.cover] } : {}),
    },
  };
}

const PROSE =
  "mt-8 max-w-none text-ink-soft [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink " +
  "[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed " +
  "[&_a]:text-brand [&_a]:underline [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_li]:mt-1 [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_code]:rounded [&_code]:bg-paper-dim [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_img]:my-6 [&_img]:rounded-xl " +
  "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-paper";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getPublishedPost(slug);
  if (!row) notFound();
  const { post, authorName } = row;
  const html = renderMarkdown(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    ...(post.cover ? { image: post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}` } : {}),
  };

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="max-w-2xl py-16 sm:py-24">
        <Link href="/blog" className="text-sm text-muted hover:text-ink">
          ← All posts
        </Link>
        <h1 className="mt-6 font-display text-4xl font-semibold text-balance sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {post.publishedAt && new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(post.publishedAt)}
          {authorName ? ` · ${authorName}` : ""}
        </p>
        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt={post.title} className="mt-8 w-full rounded-2xl object-cover" />
        )}
        {/* Content is admin-authored Markdown rendered to HTML (trusted source). */}
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
      <CallToAction />
    </main>
  );
}
