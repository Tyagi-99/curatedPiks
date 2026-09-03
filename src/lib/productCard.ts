export function checkPriceCta(storeLabel: string, storeId: string): string {
  if (!storeId || storeId === "custom") return "Check latest price →";
  return `View on ${storeLabel} →`;
}

export function editorialBadge(product: { pinnedToBio?: boolean; popular?: boolean }): string | null {
  if (product.pinnedToBio) return "Editor's Pick";
  if (product.popular) return "Top Pick";
  return null;
}

function formatReviewCount(count: number): string {
  if (count >= 1000) {
    const thousands = count / 1000;
    const compact = thousands >= 10 ? Math.round(thousands).toString() : thousands.toFixed(1).replace(/\.0$/, "");
    return `${compact}k`;
  }
  return new Intl.NumberFormat("en-IN").format(count);
}

export function ratingRow(rating?: number | null, reviewCount?: number | null): string | null {
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating <= 0) return null;
  if (typeof reviewCount !== "number" || !Number.isFinite(reviewCount) || reviewCount <= 0) return null;
  const stars = Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
  return `★ ${stars} · ${formatReviewCount(reviewCount)} reviews`;
}
