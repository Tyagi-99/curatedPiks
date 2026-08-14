import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/links`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    ...categories.map((category) => ({ url: `${base}/c/${category.slug}` })),
    ...products.map((product) => ({
      url: `${base}/p/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
