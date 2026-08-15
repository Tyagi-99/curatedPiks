export const DISCLOSURE_COPY =
  "Some links on CuratedPicks are affiliate links. If you purchase through them, we may earn a commission at no additional cost to you.";

export const SAMPLE_EDITORIAL_NOTE =
  "SAMPLE DEMO COPY — replace before publishing a real product.";

export function parseSpecs(raw: string): { label: string; value: string }[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.entries(value as Record<string, string>)
        .map(([label, item]) => ({ label, value: String(item) }))
        .filter((row) => row.label && row.value);
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function formatUpdated(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function ctaLabel(storeLabel: string, storeId: string): string {
  if (!storeId || storeId === "custom") return "Check latest price";
  return `View on ${storeLabel}`;
}
