import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/ProductCard";
import { SiteShell } from "@/components/public/SiteShell";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!category) notFound();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-tube">Category</p>
        <h1 className="mt-2 text-5xl leading-[0.92]">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-muted">{category.description}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} source="category" />
          ))}
        </div>
        {category.products.length === 0 ? <p className="text-muted">Nothing published in this category yet.</p> : null}
      </div>
    </SiteShell>
  );
}
