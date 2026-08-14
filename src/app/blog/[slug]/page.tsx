import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "Post" };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") notFound();
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-4xl">{post.title}</h1>
        <p className="mt-3 text-muted">{post.excerpt}</p>
        <div className="mt-8 whitespace-pre-wrap leading-relaxed">{post.body}</div>
      </article>
    </SiteShell>
  );
}
