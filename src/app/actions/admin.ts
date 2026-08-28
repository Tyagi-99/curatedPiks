"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toJsonList } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  requireAdmin,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { setSettings, SITE_NAME } from "@/lib/settings";
import { urlsForStore } from "@/lib/stores";
import { isHttpUrl } from "@/lib/urls";

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
  if (id && !existing) throw new Error("That product no longer exists.");

  // A blank or stale category id used to reach Postgres and come back as an
  // unhandled foreign key error (HTTP 500).
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) {
    throw new Error("Pick a category. Create one in Categories first if the list is empty.");
  }
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("That category no longer exists.");

  // Slugs are unique; catching it here gives a real message instead of P2002.
  const slugOwner = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== id) {
    throw new Error(`The URL "${slug}" is already used by another product. Choose a different slug.`);
  }

  const affiliateUrlRaw = String(formData.get("affiliateUrl") ?? "").trim();
  if (canEditLinks && affiliateUrlRaw && !isHttpUrl(affiliateUrlRaw)) {
    throw new Error("The affiliate URL must start with http:// or https://.");
  }
  const store = String(formData.get("store") ?? existing?.store ?? "amazon");
  const affiliateUrl = canEditLinks ? affiliateUrlRaw : (existing?.affiliateUrl ?? "");
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
    categoryId,
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
  // Deleting an already-deleted row threw P2025 as an unhandled 500.
  const product = id ? await prisma.product.findUnique({ where: { id } }) : null;
  if (product) {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/links");
    revalidatePath(`/p/${product.slug}`);
    revalidatePath("/sitemap.xml");
  }
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
  if (id && !existing) throw new Error("That post no longer exists.");
  const slugOwner = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== id) {
    throw new Error(`The URL "${slug}" is already used by another post. Choose a different slug.`);
  }
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
    siteName: String(formData.get("siteName") ?? SITE_NAME),
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
  if (!fromPath.startsWith("/") || !toPath.startsWith("/")) {
    throw new Error("Both paths must start with / (for example /old-slug).");
  }
  if (fromPath === toPath) throw new Error("A path cannot redirect to itself.");
  // fromPath is unique: create() threw P2002 as a 500 when re-adding a path.
  await prisma.redirect.upsert({
    where: { fromPath },
    update: { toPath },
    create: { fromPath, toPath },
  });
  redirect("/admin/redirects");
}

export type PasswordState = { error?: string; ok?: boolean };

const MIN_PASSWORD = 12;

/**
 * There was previously no way to change an admin password: ADMIN_PASSWORD only
 * applies when the seed creates the account, so the documented default could
 * never be rotated from the UI.
 */
export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await requireUser();
  if (!user) redirect("/admin/login");

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next) return { error: "Fill in every field." };
  if (next.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters.` };
  }
  if (next.length > 200) return { error: "That password is too long." };
  if (next !== confirm) return { error: "The new passwords do not match." };
  if (next === current) return { error: "The new password must be different." };

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) redirect("/admin/login");
  if (!(await verifyPassword(current, record.passwordHash))) {
    return { error: "That is not your current password." };
  }

  const changedAt = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), passwordChangedAt: changedAt },
  });

  // Every existing cookie is now stale, including this browser's, so mint a
  // fresh one rather than signing the current admin out of their own session.
  await createSession(user);
  return { ok: true };
}

// Message.read was written by nothing, so the dashboard's "Unread mail" count
// always equalled the total message count.
export async function markMessageRead(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  if (id) {
    const message = await prisma.message.findUnique({ where: { id } });
    if (message) await prisma.message.update({ where: { id }, data: { read: true } });
  }
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  redirect("/admin/messages");
}

export async function saveCategory(formData: FormData) {
  const user = await requireAdmin();
  if (!user) redirect("/admin");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  // slugify strips everything non-alphanumeric, so a name like "!!!" yields ""
  // and would have written a category with an empty slug.
  if (!name || !slug) throw new Error("Give the category a name using letters or numbers.");
  const description = String(formData.get("description") ?? "");
  await prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description },
  });
  redirect("/admin/categories");
}
