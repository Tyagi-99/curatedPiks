import { ProductCard } from "@/components/public/ProductCard";
import { ShopGrid } from "@/components/public/ShopGrid";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, products] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const featured = products.filter((product) => product.pinnedToBio).slice(0, 3);
  const featuredFallback = featured.length > 0 ? featured : products.slice(0, 3);
  const recent = [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);
  const popular = products.filter((product) => product.popular).slice(0, 3);
  const popularFallback = popular.length > 0 ? popular : products.slice(0, 3);
  const instagram = settings.instagramUrl || "https://instagram.com/";

  return (
    <SiteShell>
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
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm"
            >
              Instagram
            </a>
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
            <ShopGrid products={products} source="home" />
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
      </div>
    </SiteShell>
  );
}
