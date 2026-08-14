import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSession } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/posts", label: "Blog" },
  { href: "/admin/analytics", label: "Clicks" },
  { href: "/admin/messages", label: "Inbox" },
  { href: "/admin/subscribers", label: "Newsletter" },
  { href: "/admin/redirects", label: "Redirects" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-surface p-4 md:block">
        <div className="flex items-center justify-between gap-2">
          <div className="font-serif text-xl">CuratedPicks</div>
          <ThemeToggle />
        </div>
        <p className="mt-1 text-xs text-faint">{user.role}</p>
        <nav className="mt-6 space-y-1 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-1.5 hover:bg-bg">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="text-sm text-muted hover:text-text">
            Log out
          </button>
        </form>
        <Link href="/" className="mt-4 block text-sm text-accent">
          View site
        </Link>
      </aside>
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
          <span className="font-serif">Admin</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin/products" className="text-sm">
              Products
            </Link>
          </div>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
