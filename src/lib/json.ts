export function parseStringList(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

export function toJsonList(text: string): string {
  const items = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}
