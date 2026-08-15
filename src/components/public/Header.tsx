import Link from "next/link";
import { MobileNav } from "@/components/public/MobileNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSettings } from "@/lib/settings";

const links = [
  { href: "/#shop", label: "Shop" },
  { href: "/c/tech-gadgets", label: "Tech" },
  { href: "/c/home-kitchen", label: "Home" },
  { href: "/c/health-fitness", label: "Fitness" },
  { href: "/c/fashion-accessories", label: "Fashion" },
  { href: "/c/beauty", label: "Beauty" },
];

export async function Header() {
  const settings = await getSettings();
  const instagram = settings.instagramUrl;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <MobileNav
            links={[
              ...links,
              ...(instagram ? [{ href: instagram, label: "Instagram" }] : []),
              { href: "/how-we-review", label: "How we review" },
              { href: "/contact", label: "Contact" },
            ]}
          />
          <Link href="/" className="font-display text-2xl tracking-tight">
            {settings.siteName}
          </Link>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="rounded-full" />
          {instagram ? (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-line px-3 py-1.5 text-sm sm:inline"
            >
              Instagram
            </a>
          ) : null}
          <Link href="/#shop" className="rounded-full bg-text px-3 py-1.5 text-sm font-semibold text-bg">
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
