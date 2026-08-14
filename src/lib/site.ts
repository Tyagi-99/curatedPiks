export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function productShareUrl(slug: string, source = "ig") {
  return `${siteUrl()}/p/${slug}?src=${encodeURIComponent(source)}`;
}

export function instagramReply(slug: string) {
  return `Here's the full pick + buy links: ${productShareUrl(slug, "ig")}`;
}

export const SOCIAL_SOURCES = [
  { id: "ig", label: "Instagram comment" },
  { id: "fb", label: "Facebook comment" },
  { id: "reel", label: "Reel" },
  { id: "story", label: "Story" },
  { id: "bio", label: "Link in bio" },
] as const;
