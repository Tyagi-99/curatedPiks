function requiredSecret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (value && !value.includes("change-this")) return value;
  if (process.env.VERCEL) {
    throw new Error("AUTH_SECRET must be set in Vercel project settings.");
  }
  return value || "curatedpicks-local-dev-only-auth-secret-32b";
}

export const AUTH_SECRET = requiredSecret();

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production.replace(/\/$/, "")}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
