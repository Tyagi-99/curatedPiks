import Link from "next/link";
import { MobileNav } from "@/components/public/MobileNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSettings } from "@/lib/settings";

const links = [
  { href: "/links", label: "Picks" },
  { href: "/c/tech-gadgets", label: "Tech" },
  { href: "/c/home-kitchen", label: "Home" },
  { href: "/c/health-fitness", label: "Fitness" },
  { href: "/c/fashion-accessories", label: "Fashion" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const settings = await getSettings();
  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md">
      <div className="tube-bar" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <MobileNav links={links} />
          <Link href="/" className="font-display text-2xl tracking-tight">
            {settings.siteName}
          </Link>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/links"
            className="bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
