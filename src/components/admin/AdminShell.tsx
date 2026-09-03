"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type NavItem = { href: string; label: string; badge?: number };
type NavGroup = { heading: string; items: NavItem[] };

function pageTitle(pathname: string, dashboardHref: string) {
  const rest = pathname.slice(dashboardHref.length) || "/";
  if (rest === "/" || rest === "") return "Dashboard";
  if (rest.startsWith("/products/new")) return "New product";
  if (rest.startsWith("/products/")) return "Edit product";
  if (rest.startsWith("/products")) return "Products";
  if (rest.startsWith("/posts/new")) return "New article";
  if (rest.startsWith("/posts/")) return "Edit article";
  if (rest.startsWith("/posts")) return "Blog";
  if (rest.startsWith("/categories")) return "Categories";
  if (rest.startsWith("/analytics")) return "Clicks";
  if (rest.startsWith("/messages")) return "Inbox";
  if (rest.startsWith("/subscribers")) return "Newsletter";
  if (rest.startsWith("/redirects")) return "Redirects";
  if (rest.startsWith("/settings")) return "Settings";
  return "CMS";
}

export function AdminShell({
  children,
  action,
  email,
  role,
  groups,
  viewSiteHref,
  dashboardHref,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  email: string;
  role: string;
  groups: NavGroup[];
  viewSiteHref: string;
  dashboardHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = pageTitle(pathname, dashboardHref);

  function isActive(href: string) {
    if (href === dashboardHref) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 text-sm">
      {groups.map((group) => (
        <div key={group.heading}>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{group.heading}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-2 py-2 ${
                      active ? "bg-bg font-medium text-text" : "text-muted hover:bg-bg hover:text-text"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-danger-soft px-1.5 text-[11px] font-medium text-danger">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="cms flex min-h-screen bg-bg">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="border-b border-line px-4 py-4">
          <p className="font-display text-xl leading-none">DealDuniya</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-faint">Editorial CMS</p>
        </div>
        <div className="flex flex-1 flex-col px-3 py-4">
          {nav}
          <div className="mt-auto space-y-3 border-t border-line pt-4">
            <Link href={viewSiteHref} className="block px-2 text-sm text-muted hover:text-text">
              View site
            </Link>
            <p className="px-2 text-xs text-faint">
              {email}
              <br />
              {role}
            </p>
            <form action={logoutAction}>
              <button type="submit" className="px-2 text-sm text-muted hover:text-text">
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex h-full w-64 flex-col bg-surface p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg">DealDuniya</p>
              <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {nav}
            <form action={logoutAction} className="mt-6">
              <button type="submit" className="text-sm text-muted">
                Log out
              </button>
            </form>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-line px-3 py-2 text-sm md:hidden"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-cms-nav"
            >
              Menu
            </button>
            <p className="truncate font-display text-2xl">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            {action}
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
