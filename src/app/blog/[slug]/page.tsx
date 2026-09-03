import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/public/SiteShell";
import { getSession } from "@/lib/auth";
import { formatUpdated } from "@/lib/editorial";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { renderMarkdown } from "@/lib/markdown";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

const getPost = cache((slug: string) => prisma.post.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  // Draft previews are reachable with a session, so keep them unindexed.
  if (!post || post.status !== "PUBLISHED") {
    return { title: "Blog", robots: { index: false, follow: false } };
  }
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image = post.coverImageUrl || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${slug}`,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, session, settings] = await Promise.all([
    getPost(slug),
    getSession(),
    getSettings(),
  ]);
  if (!post) notFound();
  const isDraft = post.status !== "PUBLISHED";
  if (isDraft && !session) notFound();

  const date = formatUpdated(post.publishedAt ?? post.createdAt);
  const html = renderMarkdown(post.body);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    articleJsonLd({
      headline: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      path: `/blog/${post.slug}`,
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt,
      image: post.coverImageUrl || undefined,
      publisherName: settings.siteName,
    }),
  ];

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <article className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-muted">
          <Link href="/blog" className="hover:text-text">
            Blog
          </Link>
        </p>
        {isDraft ? (
          <p className="mt-3 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">Draft preview</p>
        ) : null}
        <h1 className="mt-3 text-5xl leading-[1.05]">{post.title}</h1>
        {date ? <p className="mt-3 text-sm text-faint">{isDraft ? "Updated" : "Published"} {date}</p> : null}
        {post.excerpt ? <p className="mt-4 text-lg text-muted">{post.excerpt}</p> : null}
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover" />
        ) : null}
        <div
          className="mt-8 space-y-4 leading-relaxed text-muted [&_a]:text-accent [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-text [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:text-text [&_img]:rounded-2xl [&_strong]:text-text [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </SiteShell>
  );
}
