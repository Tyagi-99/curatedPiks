function requiredSecret() {
  const value = process.env.AUTH_SECRET?.trim();
  const usable = Boolean(value) && !value!.includes("change-this");

  // Session cookies are signed with this. Falling back to a hardcoded value in
  // any production environment would let anyone forge an admin session, so the
  // guard must not depend on being on Vercel specifically.
  if (!usable && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
    throw new Error("AUTH_SECRET must be set to a unique random value in production.");
  }
  if (usable && value!.length < 32 && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
    throw new Error("AUTH_SECRET must be at least 32 characters in production.");
  }
  return usable ? value! : "curatedpicks-local-dev-only-auth-secret-32b";
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
