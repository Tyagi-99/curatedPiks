import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories, posts] = await Promise.all([
    prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/links`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    { url: `${base}/how-we-review`, lastModified: new Date() },
    { url: `${base}/legal/affiliate`, lastModified: new Date() },
    { url: `${base}/legal/privacy`, lastModified: new Date() },
    { url: `${base}/legal/terms`, lastModified: new Date() },
    { url: `${base}/legal/cookies`, lastModified: new Date() },
    ...categories.map((category) => ({ url: `${base}/c/${category.slug}` })),
    ...products.map((product) => ({
      url: `${base}/p/${product.slug}`,
      lastModified: product.updatedAt,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
