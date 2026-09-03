import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/public/ShopGrid";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Product reviews",
  description: "Every DealDuniya product review, with photos, trade-offs, and a link to check the current price.",
  alternates: { canonical: "/links" },
};

// Every product is serialised into the client payload for the search/filter UI,
// so the query is capped rather than unbounded as the catalogue grows.
const MAX_PRODUCTS = 120;

export default async function LinksPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
      take: MAX_PRODUCTS,
    }),
    prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const categoryFilters = categories.map((c) => ({ slug: c.slug, label: c.name }));

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-5xl leading-[1.05]">Product reviews</h1>
        <p className="mt-4 max-w-xl text-muted">
          Read the verdict, then check the current price on the retailer if it still fits.
        </p>
        <section className="mt-8">
          <h2 className="sr-only">All products</h2>
          <Suspense fallback={<p className="text-sm text-muted">Loading products…</p>}>
            <ShopGrid products={products} source="bio" categories={categoryFilters} />
          </Suspense>
        </section>
      </div>
    </SiteShell>
  );
}
