import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/public/SiteShell";
import { splitLegalBlocks } from "@/lib/legalRender";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

const getLegalPage = cache((slug: string) => prisma.page.findUnique({ where: { slug } }));

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({ select: { slug: true } });
  return pages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return { title: "Legal", robots: { index: false, follow: false } };
  return {
    title: page.title,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  const blocks = splitLegalBlocks(page.body);

  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-tube">Legal</p>
        <h1 className="mt-2 text-4xl leading-[1.05]">{page.title}</h1>
        {/* Driven by the row's own timestamp; this used to be a hardcoded date
            that would silently go stale after any edit. */}
        <p className="mt-2 text-sm text-faint">
          Last updated{" "}
          {page.updatedAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {SITE_NAME}
        </p>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
          {blocks.map((block, index) =>
            block.type === "h2" ? (
              <h2 key={`${block.text}-${index}`} className="pt-2 font-display text-2xl text-text">
                {block.text}
              </h2>
            ) : (
              <p key={`${block.text}-${index}`} className="whitespace-pre-wrap">
                {block.text}
              </p>
            ),
          )}
        </div>
      </article>
    </SiteShell>
  );
}
