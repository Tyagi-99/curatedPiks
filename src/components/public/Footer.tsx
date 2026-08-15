import Link from "next/link";
import { DISCLOSURE_COPY } from "@/lib/editorial";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-3xl tracking-tight">{settings.siteName}</div>
          <p className="mt-2 max-w-md text-sm text-muted">{settings.tagline}</p>
        </div>
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Browse</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/links">All picks</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/how-we-review">How we review</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/legal/affiliate">Affiliate disclosure</Link>
            </li>
            <li>
              <Link href="/legal/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/legal/terms">Terms</Link>
            </li>
            <li>
              <Link href="/legal/cookies">Cookies</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-faint">
        © {new Date().getFullYear()} {settings.siteName}. {settings.disclosure || DISCLOSURE_COPY}
      </div>
    </footer>
  );
}
