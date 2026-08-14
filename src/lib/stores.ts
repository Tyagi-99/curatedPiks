export const STORES = [
  { id: "amazon", label: "Amazon", badgeClass: "bg-[#FF9900] text-black", buttonClass: "bg-[#FF9900] text-black hover:bg-[#e68a00]" },
  { id: "flipkart", label: "Flipkart", badgeClass: "bg-[#2874F0] text-white", buttonClass: "bg-[#2874F0] text-white hover:bg-[#1c5dc9]" },
  { id: "myntra", label: "Myntra", badgeClass: "bg-[#E91E63] text-white", buttonClass: "bg-[#E91E63] text-white hover:bg-[#c2185b]" },
  { id: "ajio", label: "Ajio", badgeClass: "bg-[#2C4152] text-white", buttonClass: "bg-[#2C4152] text-white hover:bg-[#1f2e3a]" },
  { id: "nykaa", label: "Nykaa", badgeClass: "bg-[#FC2779] text-white", buttonClass: "bg-[#FC2779] text-white hover:bg-[#e01e6a]" },
  { id: "meesho", label: "Meesho", badgeClass: "bg-[#F43397] text-white", buttonClass: "bg-[#F43397] text-white hover:bg-[#d91f82]" },
  { id: "custom", label: "Store", badgeClass: "bg-[#111111] text-white", buttonClass: "bg-[#111111] text-white hover:bg-black" },
] as const;

export type StoreId = (typeof STORES)[number]["id"];

export const STORE_FILTERS = STORES.filter((store) => store.id !== "custom");

export const CATEGORY_FILTERS = [
  { slug: "home-kitchen", label: "Home Decor" },
  { slug: "fashion-accessories", label: "Fashion" },
  { slug: "tech-gadgets", label: "Tech" },
  { slug: "beauty", label: "Beauty" },
  { slug: "health-fitness", label: "Fitness" },
] as const;

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
