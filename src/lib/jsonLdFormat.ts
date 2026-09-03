export function absoluteAssetUrl(value: string, origin: string): string {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${origin}${path}`;
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteSearchAction(origin: string) {
  return {
    "@type": "SearchAction",
    target: `${origin}/links?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  };
}
