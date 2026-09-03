import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";
import { formatUpdated } from "@/lib/editorial";
import { itemListJsonLd, jsonLdScript } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides and longer notes from DealDuniya — what to check before you buy.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  const jsonLd = itemListJsonLd(
    "DealDuniya blog",
    posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
  );

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-muted">Guides</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">Blog</h1>
        <p className="mt-3 max-w-xl text-muted">
          Longer notes on how to choose products — useful even if you never tap a buy button.
        </p>
        <div className="mt-10 space-y-6">
          {posts.length === 0 ? <p className="text-muted">No guides published yet.</p> : null}
          {posts.map((post) => {
            const date = formatUpdated(post.publishedAt ?? post.createdAt);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block overflow-hidden rounded-3xl border border-line bg-surface"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : null}
                <div className="p-5">
                  {date ? <p className="text-xs text-faint">{date}</p> : null}
                  <h2 className="mt-1 font-display text-3xl">{post.title}</h2>
                  {post.excerpt ? <p className="mt-2 text-sm text-muted">{post.excerpt}</p> : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
