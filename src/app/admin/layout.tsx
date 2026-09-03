import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/adminPath";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: { default: "CMS", template: "%s · CMS" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) return <>{children}</>;

  const unread = user.role === "ADMIN" ? await prisma.message.count({ where: { read: false } }) : 0;
  const groups = [
    { heading: "Overview", items: [{ href: adminPath(), label: "Dashboard" }] },
    {
      heading: "Content",
      items: [
        { href: adminPath("products"), label: "Products" },
        { href: adminPath("categories"), label: "Categories" },
        { href: adminPath("posts"), label: "Blog" },
      ],
    },
    {
      heading: "Commerce",
      items: [
        { href: adminPath("analytics"), label: "Clicks" },
        ...(user.role === "ADMIN" ? [{ href: adminPath("redirects"), label: "Redirects" }] : []),
      ],
    },
    {
      heading: "Communication",
      items: user.role === "ADMIN"
        ? [
            { href: adminPath("messages"), label: "Inbox", badge: unread || undefined },
            { href: adminPath("subscribers"), label: "Newsletter" },
          ]
        : [],
    },
    { heading: "System", items: [{ href: adminPath("settings"), label: "Settings" }] },
  ].filter((group) => group.items.length > 0);

  return (
    <AdminShell
      email={user.email}
      role={user.role}
      groups={groups}
      viewSiteHref="/"
      dashboardHref={adminPath()}
    >
      {children}
    </AdminShell>
  );
}
