"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toJsonList } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { setSettings } from "@/lib/settings";
import { urlsForStore } from "@/lib/stores";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function saveProduct(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || title);
  if (!title || !slug) throw new Error("Title is required");

  const canEditLinks = user.role === "ADMIN";
  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;
  const store = String(formData.get("store") ?? existing?.store ?? "amazon");
  const affiliateUrl = canEditLinks
    ? String(formData.get("affiliateUrl") ?? "")
    : (existing?.affiliateUrl ?? "");
  const storeUrls = canEditLinks ? urlsForStore(store, affiliateUrl) : {};
  const specs: Record<string, string> = {};
  for (const line of String(formData.get("specs") ?? "").split("\n")) {
    const [label, ...rest] = line.split(":");
    if (label && rest.length) specs[label.trim()] = rest.join(":").trim();
  }

  const priceInr = Number(formData.get("priceInr") || 0);
  const compareAtInr = formData.get("compareAtInr") ? Number(formData.get("compareAtInr")) : null;
  const priceChanged =
    !existing || existing.priceInr !== priceInr || existing.compareAtInr !== compareAtInr;

  const data = {
    title,
    slug,
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    quickVerdict: String(formData.get("quickVerdict") ?? ""),
    whyFeatured: String(formData.get("whyFeatured") ?? ""),
    highlightsJson: toJsonList(String(formData.get("highlights") ?? "")),
    bestForJson: toJsonList(String(formData.get("bestFor") ?? "")),
    notForJson: toJsonList(String(formData.get("notFor") ?? "")),
    finalVerdict: String(formData.get("finalVerdict") ?? ""),
    editorialNotes: String(formData.get("editorialNotes") ?? ""),
    priceInr,
    compareAtInr,
    imageUrl: String(formData.get("imageUrl") ?? ""),
    ogImageUrl: String(formData.get("ogImageUrl") ?? ""),
    prosJson: toJsonList(String(formData.get("pros") ?? "")),
    consJson: toJsonList(String(formData.get("cons") ?? "")),
    featuresJson: JSON.stringify(specs),
    categoryId: String(formData.get("categoryId") ?? ""),
    published: user.role === "ADMIN" ? formData.get("published") === "on" : false,
    pinnedToBio: user.role === "ADMIN" ? formData.get("pinnedToBio") === "on" : (existing?.pinnedToBio ?? false),
    popular: user.role === "ADMIN" ? formData.get("popular") === "on" : (existing?.popular ?? false),
    sortOrder: Number(formData.get("sortOrder") || existing?.sortOrder || 0),
    store,
    ...storeUrls,
    lastPriceCheckedAt: priceChanged ? new Date() : (existing?.lastPriceCheckedAt ?? null),
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/links");
  revalidatePath(`/p/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/sitemap.xml");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function savePost(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (!title || !slug) throw new Error("Title is required");
  const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
  const publish = user.role === "ADMIN" && formData.get("published") === "on";
  const status = publish ? "PUBLISHED" : "DRAFT";
  const publishedAt = publish ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);
  const data = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") ?? ""),
    body: String(formData.get("body") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    status,
    publishedAt,
    authorId: user.id,
  };
  if (id) await prisma.post.update({ where: { id }, data });
  else await prisma.post.create({ data });
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({ where: { id } });
  if (post) {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
  }
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function saveSettings(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  await setSettings({
    siteName: String(formData.get("siteName") ?? "CuratedPicks"),
    tagline: String(formData.get("tagline") ?? ""),
    disclosure: String(formData.get("disclosure") ?? ""),
    adsenseClient: String(formData.get("adsenseClient") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
  });
  const pages = ["affiliate", "privacy", "terms", "cookies"] as const;
  for (const slug of pages) {
    const title = String(formData.get(`pageTitle_${slug}`) ?? "");
    const body = String(formData.get(`pageBody_${slug}`) ?? "");
    if (title && body) {
      await prisma.page.upsert({
        where: { slug },
        update: { title, body },
        create: { slug, title, body },
      });
    }
  }
  revalidatePath("/");
  redirect("/admin/settings");
}

export async function saveRedirect(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const fromPath = String(formData.get("fromPath") ?? "").trim();
  const toPath = String(formData.get("toPath") ?? "").trim();
  if (!fromPath || !toPath) throw new Error("Both paths required");
  await prisma.redirect.create({ data: { fromPath, toPath } });
  redirect("/admin/redirects");
}

export async function saveCategory(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const description = String(formData.get("description") ?? "");
  await prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description },
  });
  redirect("/admin/categories");
}
