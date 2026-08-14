import type { Metadata } from "next";
import { ShopGrid } from "@/components/public/ShopGrid";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Shop the reels",
  description: "Every product featured in the videos, with a direct buy button.",
};

export default async function LinksPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: [{ pinnedToBio: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted">Instagram bio</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">Shop the reels</h1>
        <p className="mt-4 max-w-xl text-muted">Buy the products you saw in the videos.</p>
        <div className="mt-8">
          <ShopGrid products={products} source="bio" />
        </div>
      </div>
    </SiteShell>
  );
}
