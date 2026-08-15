import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/public/SiteShell";
import { splitLegalBlocks } from "@/lib/legalRender";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  return {
    title: page?.title ?? "Legal",
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();

  const blocks = splitLegalBlocks(page.body);

  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-tube">Legal</p>
        <h1 className="mt-2 text-4xl leading-[1.05]">{page.title}</h1>
        <p className="mt-2 text-sm text-faint">Last updated 14 August 2026 · CuratedPicks</p>
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
