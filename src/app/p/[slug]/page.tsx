import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButtons } from "@/components/public/BuyButtons";
import { ProductCard } from "@/components/public/ProductCard";
import { ShareActions } from "@/components/public/ShareActions";
import { SiteShell } from "@/components/public/SiteShell";
import { siteUrl } from "@/lib/env";
import { parseStringList } from "@/lib/json";
import { discountPercent, formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { resolveStore } from "@/lib/stores";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
};

function parseSpecs(raw: string): { label: string; value: string }[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.entries(value as Record<string, string>).map(([label, item]) => ({
        label,
        value: String(item),
      }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.published) return { title: "Product" };
  const store = resolveStore(product);
  const title = `${product.title} — ${store.label}`;
  const description = product.shortDescription;
  const image = product.ogImageUrl || product.imageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
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

  const features = parseStringList(product.prosJson);
  const specs = parseSpecs(product.featuresJson);
  const off = discountPercent(product.priceInr, product.compareAtInr);
  const store = resolveStore(product);
  const images = [product.imageUrl, product.ogImageUrl].filter((value, index, all) => value && all.indexOf(value) === index);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: images,
    brand: { "@type": "Brand", name: "CuratedPicks" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.priceInr,
      availability: "https://schema.org/InStock",
      url: `${siteUrl()}/p/${product.slug}`,
    },
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-4 py-6 pb-16">
        <Link href="/#shop" className="text-sm text-muted">
          ← All products
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.title} className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]" />
          ) : (
            <div className="grid aspect-[4/5] place-items-center font-display text-7xl text-faint">∎</div>
          )}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image} src={image} alt="" className="h-20 w-16 rounded-xl object-cover" />
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${store.badgeClass}`}>{store.label}</span>
          {off ? <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white">{off}% off</span> : null}
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px]">{product.category.name}</span>
        </div>

        <h1 className="mt-4 text-4xl leading-[0.95] sm:text-5xl">{product.title}</h1>
        <p className="mt-3 text-muted">{product.shortDescription}</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-semibold">{formatInr(product.priceInr)}</span>
          {product.compareAtInr ? <span className="text-muted line-through">{formatInr(product.compareAtInr)}</span> : null}
        </div>

        <div className="mt-6">
          <BuyButtons
            productId={product.id}
            source={source}
            store={product.store}
            affiliateUrl={product.affiliateUrl}
            amazonUrl={product.amazonUrl}
            flipkartUrl={product.flipkartUrl}
            networkUrl={product.networkUrl}
            sticky
          />
        </div>

        <div className="mt-6">
          <ShareActions url={`${siteUrl()}/p/${product.slug}`} title={product.title} />
        </div>

        {product.description ? (
          <section className="mt-10">
            <h2 className="text-3xl">Description</h2>
            <p className="mt-3 leading-relaxed text-muted">{product.description}</p>
          </section>
        ) : null}

        {features.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-3xl">Features</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {specs.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-3xl">Specifications</h2>
            <dl className="mt-3 divide-y divide-line border-y border-line">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-3xl">You might also like</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} source={source} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </SiteShell>
  );
}
