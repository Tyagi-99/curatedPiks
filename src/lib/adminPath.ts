/**
 * Public CMS prefix. Internal App Router folders stay under /admin.
 * Override with ADMIN_BASE_PATH (server-only, never NEXT_PUBLIC_).
 */
export const ADMIN_SEGMENT = "x7Kp9mQ2vL4rT8nW";

function segment(): string {
  const fromEnv = process.env.ADMIN_BASE_PATH?.trim().replace(/^\/+|\/+$/g, "");
  return fromEnv || ADMIN_SEGMENT;
}

export function adminBasePath(): string {
  return `/${segment()}`;
}

export function adminPath(suffix = ""): string {
  const clean = suffix.replace(/^\/+|\/+$/g, "");
  const base = adminBasePath();
  return clean ? `${base}/${clean}` : base;
}

export function isPublicAdminProbe(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isSecretAdminPath(pathname: string): boolean {
  const base = adminBasePath();
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function toInternalAdminPath(pathname: string): string {
  const base = adminBasePath();
  if (pathname === base) return "/admin";
  if (pathname.startsWith(`${base}/`)) return `/admin/${pathname.slice(base.length + 1)}`;
  return pathname;
}
