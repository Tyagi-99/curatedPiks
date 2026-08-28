import { headers } from "next/headers";

/**
 * Client IP for server actions, which have no Request object.
 *
 * Kept out of rateLimit.ts because importing `next/headers` there would make
 * that module unloadable in plain-Node unit tests.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
