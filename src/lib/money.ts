export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function showCompareAt(price: number, compareAt?: number | null): boolean {
  return Boolean(compareAt && compareAt > price);
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!showCompareAt(price, compareAt) || !compareAt) return null;
  return Math.round((1 - price / compareAt) * 100);
}
