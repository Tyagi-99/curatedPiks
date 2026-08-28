import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/public/ProductCard";
import { ShopGrid } from "@/components/public/ShopGrid";
import { SiteShell } from "@/components/public/SiteShell";
import { organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The grid ships every product to the client for search/filtering, so the query
// is capped instead of growing without bound.
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
    prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const categoryFilters = categories.map((c) => ({ slug: c.slug, label: c.name }));

  const featured = products.filter((product) => product.pinnedToBio).slice(0, 3);
  const featuredFallback = featured.length > 0 ? featured : products.slice(0, 3);
  const recent = [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);
  const popular = products.filter((product) => product.popular).slice(0, 3);
  const popularFallback = popular.length > 0 ? popular : products.slice(0, 3);
  const instagram = settings.instagramUrl;
  const facebook = settings.facebookUrl;

  // Organization + WebSite markup was already written and tested in json-ld.ts
  // but never rendered, so the homepage published no structured data at all.
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm tracking-wide text-muted">Curated from my reels</p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] sm:text-7xl">Products Featured In My Videos</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Buy all the products you&apos;ve seen in my Instagram videos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#shop" className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-bg">
              Shop the collection
            </a>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
        <section>
          <h2 className="text-4xl">Featured</h2>
          <p className="mt-2 text-sm text-muted">The pieces people ask about most.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredFallback.map((product) => (
              <ProductCard key={product.id} product={product} source="home" />
            ))}
          </div>
        </section>

        <section id="shop">
          <h2 className="text-4xl">Everything featured</h2>
          <div className="mt-6">
            <ShopGrid products={products} source="home" categories={categoryFilters} />
          </div>
        </section>

        <section>
          <h2 className="text-4xl">Recently added</h2>
          <div className="mt-6 grid gap-3">
            {recent.map((product) => (
              <ProductCard key={product.id} product={product} source="recent" compact />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-4xl">Popular right now</h2>
          <div className="mt-6 grid gap-3">
            {popularFallback.map((product) => (
              <ProductCard key={product.id} product={product} source="popular" compact />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-3xl">How we choose products</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Picks start from the reels. We only publish a page when the listed specs and trade-offs are clear
            enough to write an honest take. Affiliate terms do not decide the shortlist.
          </p>
          <Link href="/how-we-review" className="mt-4 inline-block text-sm font-medium underline">
            Read how we review
          </Link>
        </section>

        {instagram || facebook ? (
          <section>
            <h2 className="text-3xl">Follow us</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-5 py-3 text-sm"
                >
                  Instagram
                </a>
              ) : null}
              {facebook ? (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-5 py-3 text-sm"
                >
                  Facebook
                </a>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}
