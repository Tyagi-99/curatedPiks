import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductReview } from "@/components/public/ProductReview";
import { SiteShell } from "@/components/public/SiteShell";
import { siteUrl } from "@/lib/env";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";
import { resolveStore } from "@/lib/stores";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.published) return { title: "Product" };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductReview
        product={product}
        related={related}
        source={source}
        shareUrl={`${siteUrl()}${path}`}
      />
    </SiteShell>
  );
}
