/**
 * Every retailer shares one buy-button treatment. Retailer brand colours
 * (Amazon orange, Nykaa pink, Flipkart blue, …) made the grid look like a
 * collection of other people's logos; the retailer is still named in the
 * button label and the badge, so nothing is lost by dropping the colour.
 *
 * Defined as tokens in globals.css so both themes stay in sync.
 */
export const STORE_BUTTON_CLASS = "bg-cta text-cta-ink hover:bg-cta-hover";

/** Neutral pill: readable, and it no longer competes with the gold CTA. */
export const STORE_BADGE_CLASS = "bg-surface/90 text-text border border-line backdrop-blur-sm";

export const STORES = [
  { id: "amazon", label: "Amazon", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "flipkart", label: "Flipkart", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "myntra", label: "Myntra", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "ajio", label: "Ajio", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "nykaa", label: "Nykaa", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "meesho", label: "Meesho", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
  { id: "custom", label: "Store", badgeClass: STORE_BADGE_CLASS, buttonClass: STORE_BUTTON_CLASS },
] as const;

export type StoreId = (typeof STORES)[number]["id"];

export const STORE_FILTERS = STORES.filter((store) => store.id !== "custom");

/**
 * Fallback filter list used only if the caller passes no categories.
 * ShopGrid now receives the real categories from the database, so a category
 * added in admin shows up as a filter instead of being silently missing.
 */
export const CATEGORY_FILTERS = [
  { slug: "home-kitchen", label: "Home Decor" },
  { slug: "fashion-accessories", label: "Fashion" },
  { slug: "tech-gadgets", label: "Tech" },
  { slug: "beauty", label: "Beauty" },
  { slug: "health-fitness", label: "Fitness" },
] as const;

export type CategoryFilter = { slug: string; label: string };

type ProductLike = {
  store?: string | null;
  affiliateUrl?: string | null;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  networkUrl?: string | null;
};

function byId(id: string) {
  return STORES.find((store) => store.id === id) ?? STORES[STORES.length - 1];
}

export function resolveStore(product: ProductLike) {
  const explicit = product.store ? STORES.find((store) => store.id === product.store) : undefined;
  if (explicit) {
    const fallback =
      explicit.id === "amazon"
        ? product.amazonUrl
        : explicit.id === "flipkart"
          ? product.flipkartUrl
          : product.networkUrl;
    return {
      ...explicit,
      url: product.affiliateUrl || fallback || product.amazonUrl || product.flipkartUrl || product.networkUrl || "",
    };
  }
  if (product.amazonUrl) return { ...byId("amazon"), url: product.affiliateUrl || product.amazonUrl };
  if (product.flipkartUrl) return { ...byId("flipkart"), url: product.affiliateUrl || product.flipkartUrl };
  if (product.networkUrl) return { ...byId("custom"), url: product.affiliateUrl || product.networkUrl };
  return { ...byId("custom"), url: product.affiliateUrl || "" };
}

export function urlsForStore(store: string, affiliateUrl: string) {
  return {
    store,
    affiliateUrl,
    amazonUrl: store === "amazon" ? affiliateUrl : "",
    flipkartUrl: store === "flipkart" ? affiliateUrl : "",
    networkUrl: store !== "amazon" && store !== "flipkart" ? affiliateUrl : "",
  };
}
