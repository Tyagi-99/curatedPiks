import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * First gate for /admin. Renamed from `middleware.ts`, which is deprecated in
 * Next 16.
 *
 * This only proves the cookie's signature. It deliberately does not check the
 * user still exists or what role they hold, because proxy code may run on a CDN
 * edge with no database access. `getSession()` performs the authoritative check
 * (user exists, role, password-change cutoff) and every admin page calls it.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";

  const token = request.cookies.get("cp_session")?.value;
  const secret = process.env.AUTH_SECRET;
  // Fail closed if the secret is missing or still the placeholder.
  if (!token || !secret || secret.includes("change-this")) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
