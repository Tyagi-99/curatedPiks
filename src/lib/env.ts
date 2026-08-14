export const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "curatedpicks-change-this-auth-secret-32b";

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production.replace(/\/$/, "")}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
