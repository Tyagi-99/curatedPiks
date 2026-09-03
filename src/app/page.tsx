import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/public/ProductCard";
import { SearchForm } from "@/components/public/SearchForm";
import { ShopGrid } from "@/components/public/ShopGrid";
import { SiteShell } from "@/components/public/SiteShell";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Find products worth buying",
  description: "Practical product research, comparisons, and recommendations to help you buy smarter.",
  alternates: { canonical: "/" },
};

const MAX_PRODUCTS = 120;

export default async function HomePage() {
  const [settings, products, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: MAX_PRODUCTS,
    }),
    prisma.category.findMany({
      where: { products: { some: { published: true } } },
      select: { slug: true, name: true, description: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const categoryFilters = categories.map((c) => ({ slug: c.slug, label: c.name }));

  const featured = products.filter((product) => product.pinnedToBio).slice(0, 4);
  const featuredIds = new Set(featured.map((product) => product.id));
  const recent = [...products]
    .filter((product) => !featuredIds.has(product.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  const jsonLd = [
    organizationJsonLd({
      siteName: settings.siteName,
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
    }),
    websiteJsonLd({ siteName: settings.siteName, tagline: settings.tagline }),
  ];

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1 className="max-w-3xl text-4xl leading-[1.05] sm:text-6xl">Find products worth buying.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Practical product research, comparisons, and recommendations to help you buy smarter.
          </p>
          <div className="mt-8">
            <SearchForm id="home-search" size="hero" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
        {featured.length > 0 ? (
          <section id="featured">
            <h2 className="text-4xl">Trending products</h2>
            <p className="mt-2 text-sm text-muted">Picks people ask about most from the videos.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} source="home" />
              ))}
            </div>
          </section>
        ) : null}

        {categories.length > 0 ? (
          <section>
            <h2 className="text-4xl">Categories</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/c/${category.slug}`}
                  className="rounded-2xl border border-line bg-surface p-5 hover:border-text"
                >
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  {category.description ? <p className="mt-2 text-sm text-muted">{category.description}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section id="shop">
          <h2 className="text-4xl">All reviews</h2>
          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-muted">Loading products…</p>}>
              <ShopGrid products={products} source="home" categories={categoryFilters} />
            </Suspense>
          </div>
        </section>

        {recent.length > 0 ? (
          <section>
            <h2 className="text-4xl">Latest reviews</h2>
            <div className="mt-6 grid gap-3">
              {recent.map((product) => (
                <ProductCard key={product.id} product={product} source="recent" compact />
              ))}
            </div>
          </section>
        ) : null}

        <section id="guides" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-3xl">How we choose products</h2>
          <p className="mt-3 max-w-2xl text-muted">
            We only publish a page when the listed specs and trade-offs are clear enough to write an honest take.
            Affiliate terms do not decide the shortlist.
          </p>
          <Link href="/how-we-review" className="mt-4 inline-block text-sm font-medium underline">
            Read how we review
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
