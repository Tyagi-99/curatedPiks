import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/ProductCard";
import { SiteShell } from "@/components/public/SiteShell";
import { itemListJsonLd } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

const getCategory = cache((slug: string) =>
  prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category", robots: { index: false, follow: false } };
  return {
    title: category.name,
    description: category.description || `Products in ${category.name}.`,
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const jsonLd = itemListJsonLd(
    category.name,
    category.products.map((product) => ({ name: product.title, path: `/p/${product.slug}` })),
  );

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-tube">Category</p>
        <h1 className="mt-2 text-5xl leading-[0.92]">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-muted">{category.description}</p>
        <h2 className="sr-only">Products in {category.name}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} source="category" />
          ))}
        </div>
        {category.products.length === 0 ? <p className="text-muted">Nothing published in this category yet.</p> : null}
      </div>
    </SiteShell>
  );
}
