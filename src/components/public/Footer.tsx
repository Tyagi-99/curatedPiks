import Image from "next/image";
import Link from "next/link";
import { DISCLOSURE_COPY } from "@/lib/editorial";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block" aria-label="DealDuniya home" translate="no">
            <Image src="/brand/logo.webp" alt="DealDuniya" width={1000} height={347} className="h-12 w-auto" unoptimized />
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted">{settings.tagline}</p>
          <NewsletterForm />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Browse</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/links">Reviews</Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/c/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/blog">Buying guides</Link>
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
          <h2 className="text-sm font-semibold text-text">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/legal/affiliate">Affiliate disclosure</Link>
            </li>
            <li>
              <Link href="/how-we-review">Editorial policy</Link>
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
        © {new Date().getFullYear()} <span translate="no">{settings.siteName}</span>. {settings.disclosure || DISCLOSURE_COPY}
      </div>
    </footer>
  );
}
