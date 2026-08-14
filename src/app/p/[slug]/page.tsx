import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButtons } from "@/components/public/BuyButtons";
import { ProductCard } from "@/components/public/ProductCard";
import { SiteShell } from "@/components/public/SiteShell";
import { parseStringList } from "@/lib/json";
import { discountPercent, formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.published) return { title: "Product" };
  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.ogImageUrl || product.imageUrl ? [product.ogImageUrl || product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { src } = await searchParams;
  const source = src || "direct";
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.published) notFound();

  const related = await prisma.product.findMany({
    where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    take: 3,
  });

  const pros = parseStringList(product.prosJson);
  const cons = parseStringList(product.consJson);
  const off = discountPercent(product.priceInr, product.compareAtInr);

  return (
    <SiteShell>
      <article className="mx-auto max-w-xl px-4 py-6 pb-8">
        <p className="text-sm text-tube">{product.category.name}</p>

        <div className="ticket mt-4 overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="grid aspect-[4/5] place-items-center font-display text-7xl text-faint">∎</div>
          )}
        </div>

        <h1 className="mt-6 text-4xl leading-[0.95]">{product.title}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold">{formatInr(product.priceInr)}</span>
          {product.compareAtInr ? (
            <span className="font-mono text-muted line-through">{formatInr(product.compareAtInr)}</span>
          ) : null}
          {off ? (
            <span className="bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">
              -{off}%
            </span>
          ) : null}
        </div>
        {product.lastPriceCheckedAt ? (
          <p className="mt-1 font-mono text-[10px] text-faint">
            price checked {product.lastPriceCheckedAt.toLocaleDateString("en-IN")}
          </p>
        ) : null}

        <p className="mt-5 text-base leading-relaxed text-muted">{product.shortDescription}</p>
        {product.description ? <p className="mt-3 text-sm leading-relaxed">{product.description}</p> : null}

        <div className="mt-8">
          <BuyButtons
            productId={product.id}
            source={source}
            amazonUrl={product.amazonUrl}
            flipkartUrl={product.flipkartUrl}
            networkUrl={product.networkUrl}
            sticky
          />
        </div>

        <div className="mt-8 grid gap-3">
          <div className="border border-line bg-success-soft p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em]">Keeps</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {pros.map((item) => (
                <li key={item}>+ {item}</li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-danger-soft p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em]">Drops</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {cons.map((item) => (
                <li key={item}>− {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl">You might also like</h2>
            <div className="mt-4 grid gap-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} source={source} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-wider">
          <Link href="/links" className="text-accent">
            ← All picks
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
