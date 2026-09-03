import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreserveClickSource } from "@/components/public/PreserveClickSource";
import { ProductReview } from "@/components/public/ProductReview";
import { SiteShell } from "@/components/public/SiteShell";
import { siteUrl } from "@/lib/env";
import { breadcrumbJsonLd, jsonLdScript, productJsonLd } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { resolveStore } from "@/lib/stores";

type Props = { params: Promise<{ slug: string }> };

// generateMetadata and the page body both need the product; cache() makes that
// one query per request instead of two.
const getProduct = cache((slug: string) =>
  prisma.product.findUnique({ where: { slug }, include: { category: true } }),
);

// Prerender every published product at build time. Anything added later is
// rendered on first request and then cached (revalidate inherited from layout).
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  // Unpublished and missing products both render as 404s, so keep them out of
  // the index rather than letting a placeholder title get crawled.
  if (!product || !product.published) {
    return { title: "Product", robots: { index: false, follow: false } };
  }
  const store = resolveStore(product);
  const title = `${product.title} — ${store.label}`;
  const description = product.quickVerdict || product.shortDescription;
  const image = product.ogImageUrl || product.imageUrl;
  const canonical = `${siteUrl()}/p/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  // Reading searchParams here would force this page to render per request.
  // PreserveClickSource overrides this from ?src= in the browser instead.
  const source = "product";
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product || !product.published) notFound();

  const related = await prisma.product.findMany({
    where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }],
    take: 4,
  });

  const images = [product.imageUrl, product.ogImageUrl].filter(
    (value, index, all) => value && all.indexOf(value) === index,
  );
  const path = `/p/${product.slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: product.category.name, path: `/c/${product.category.slug}` },
      { name: product.title, path },
    ]),
    productJsonLd({
      name: product.title,
      description: product.shortDescription || product.quickVerdict,
      images,
      brand: product.brand || undefined,
      priceInr: product.priceInr,
      path,
    }),
  ];

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <PreserveClickSource />
      <ProductReview
        product={product}
        related={related}
        source={source}
        shareUrl={`${siteUrl()}${path}`}
        disclosure={settings.disclosure}
      />
    </SiteShell>
  );
}
