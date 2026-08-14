import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl">From the desk</h1>
        <p className="mt-2 text-muted">Longer notes you can also share on Instagram. Extra pages for ads when you have them.</p>
        <div className="mt-8 space-y-6">
          {posts.length === 0 ? <p className="text-muted">No posts yet. Publish one from admin.</p> : null}
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-serif text-2xl">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
