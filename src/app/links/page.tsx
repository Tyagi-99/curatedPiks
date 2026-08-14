import type { Metadata } from "next";
import { SiteShell } from "@/components/public/SiteShell";
import { ProductCard } from "@/components/public/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "All picks",
  description: "Every product we currently recommend, with buy links for Amazon and Flipkart.",
};

export default async function LinksPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-tube">Everything we recommend right now</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">All picks</h1>
        <p className="mt-4 text-muted">
          Open a product for the full take, or jump to Amazon or Flipkart.
        </p>
        <div className="mt-8 grid gap-6">
          {products.length === 0 ? <p className="text-muted">No picks published yet.</p> : null}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} source="bio" />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
