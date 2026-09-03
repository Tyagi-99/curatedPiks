import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/public/MobileNav";
import { SearchForm } from "@/components/public/SearchForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function Header() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const instagram = settings.instagramUrl;
  const nav = [
    { href: "/links", label: "Reviews" },
    { href: "/blog", label: "Guides" },
    { href: "/how-we-review", label: "How we review" },
    { href: "/about", label: "About" },
    ...categories.map((category) => ({ href: `/c/${category.slug}`, label: category.name })),
    ...(instagram ? [{ href: instagram, label: "Instagram" }] : []),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav links={nav} />
          <Link href="/" className="inline-flex items-center" aria-label="DealDuniya home" translate="no">
            <Image
              src="/brand/logo.webp"
              alt="DealDuniya"
              width={1000}
              height={347}
              className="h-9 w-auto md:h-10"
              priority
              unoptimized
            />
          </Link>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted lg:flex" aria-label="Primary">
          <Link href="/links" className="hover:text-text">
            Reviews
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link key={category.slug} href={`/c/${category.slug}`} className="hover:text-text">
              {category.name}
            </Link>
          ))}
          <Link href="/blog" className="hover:text-text">
            Guides
          </Link>
          <Link href="/about" className="hover:text-text">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchForm />
          </div>
          <ThemeToggle className="rounded-full" />
          <Link href="/#shop" className="rounded-full bg-text px-3 py-1.5 text-sm font-semibold text-bg">
            Browse
          </Link>
        </div>
      </div>
      <div className="border-t border-line px-4 py-2 sm:hidden">
        <SearchForm id="mobile-search" />
      </div>
    </header>
  );
}
