import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-20">
        <p className="text-sm text-muted">404</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">Page not found</h1>
        <p className="mt-4 text-muted">That URL is not on DealDuniya. The product may be unpublished, or the link may be old.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-bg">
            Home
          </Link>
          <Link href="/links" className="rounded-full border border-line px-5 py-3 text-sm">
            Browse reviews
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
