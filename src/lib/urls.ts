export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isBareSocialHomepage(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "");
    return (host === "instagram.com" || host === "facebook.com") && path === "";
  } catch {
    return false;
  }
}

export function realSocialUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  if (!isHttpUrl(value) || isBareSocialHomepage(value)) return null;
  return value;
}
