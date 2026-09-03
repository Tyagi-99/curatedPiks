import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { adminBasePath, isPublicAdminProbe, isSecretAdminPath, toInternalAdminPath } from "@/lib/adminPath";

/**
 * Cookie signature gate for the CMS. Role and existence checks stay in getSession().
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAdminProbe(pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (!isSecretAdminPath(pathname)) return NextResponse.next();

  const internal = request.nextUrl.clone();
  internal.pathname = toInternalAdminPath(pathname);

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `${adminBasePath()}/login`;
  loginUrl.search = "";

  if (internal.pathname === "/admin/login") {
    return NextResponse.rewrite(internal);
  }

  const token = request.cookies.get("cp_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.includes("change-this")) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.rewrite(internal);
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/x7Kp9mQ2vL4rT8nW", "/x7Kp9mQ2vL4rT8nW/:path*"],
};
