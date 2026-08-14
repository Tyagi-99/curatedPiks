import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";
import { ProductCard } from "@/components/public/ProductCard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          where: { published: true },
          include: { category: true },
          orderBy: { sortOrder: "asc" },
          take: 4,
        },
      },
    }),
  ]);

  const aisleOrder = ["tech-gadgets", "home-kitchen", "health-fitness", "fashion-accessories"];
  const aisles = [...categories].sort(
    (a, b) => aisleOrder.indexOf(a.slug) - aisleOrder.indexOf(b.slug),
  );

  return (
    <SiteShell>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm text-tube">Honest picks. Fair prices. India-ready.</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{settings.siteName}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            We shortlist products worth buying — real photos, a clear take, and a direct button to Amazon or Flipkart.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#aisles" className="bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover">
              Browse picks
            </a>
            <Link href="/contact" className="border border-line px-5 py-3 text-sm">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <div id="aisles" className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        {aisles.map((category) => (
          <section key={category.id}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-4xl">{category.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">{category.description}</p>
              </div>
              <Link href={`/c/${category.slug}`} className="text-sm text-accent">
                View all
              </Link>
            </div>
            {category.products.length === 0 ? (
              <p className="text-sm text-muted">Nothing in this category yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} source="home" showBuy />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
