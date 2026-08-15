import { siteUrl } from "@/lib/env";
import { realSocialUrl } from "@/lib/urls";

export function organizationJsonLd(settings: { siteName: string; instagramUrl?: string; facebookUrl?: string }) {
  const sameAs = [realSocialUrl(settings.instagramUrl), realSocialUrl(settings.facebookUrl)].filter(
    (value): value is string => Boolean(value),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: siteUrl(),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(settings: { siteName: string; tagline: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: siteUrl(),
    description: settings.tagline,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  images: string[];
  brand?: string;
  priceInr: number;
  path: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
  };
  if (input.images.length) data.image = input.images;
  if (input.brand) data.brand = { "@type": "Brand", name: input.brand };
  if (input.priceInr > 0) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: input.priceInr,
      url: `${siteUrl()}${input.path}`,
    };
  }
  return data;
}

export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${siteUrl()}${item.path}`,
    })),
  };
}
