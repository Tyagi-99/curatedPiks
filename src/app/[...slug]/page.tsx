import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Serves the rows saved in Admin → Redirects.
 *
 * Those rows previously did nothing: the admin screen wrote to the `Redirect`
 * table and nothing ever read it. The lookup cannot live in `proxy.ts`, because
 * proxy code may run on a CDN edge with no database connection, so it happens
 * here instead — a catch-all that only receives paths no real route matched.
 *
 * Route precedence means static and dynamic routes still win, so this never
 * shadows /about, /p/[slug], /c/[slug], and friends.
 */
export const dynamic = "force-dynamic";

// A 404 should not be indexed, and neither should the redirect stub.
export const metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ slug: string[] }> };

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const pathname = `/${(slug ?? []).join("/")}`;

  let target: string | null = null;
  try {
    const match = await prisma.redirect.findUnique({ where: { fromPath: pathname } });
    // Only follow internal paths; an absolute URL here would turn the admin
    // screen into an open-redirect tool.
    if (match && match.toPath.startsWith("/") && !match.toPath.startsWith("//")) {
      target = match.toPath;
    }
  } catch {
    // A database problem should still render a normal 404, not a 500.
    target = null;
  }

  if (target && target !== pathname) permanentRedirect(target);

  notFound();
}
