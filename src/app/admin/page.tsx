import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminHome() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const [products, published, clicks, messages] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.click.count(),
    prisma.message.count({ where: { read: false } }),
  ]);

  const recent = await prisma.click.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Publish a product, copy the Instagram reply, paste under the comment.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Products", products],
          ["Live", published],
          ["Buy clicks", clicks],
          ["Unread mail", messages],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-surface p-4 shadow-sm">
            <div className="text-sm text-faint">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/admin/products/new" className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          New product
        </Link>
        <Link href="/admin/analytics" className="rounded-full border border-line px-4 py-2 text-sm">
          Click report
        </Link>
      </div>
      <h2 className="mt-10 font-serif text-2xl">Latest outbound clicks</h2>
      <ul className="mt-3 divide-y divide-line rounded-2xl bg-surface">
        {recent.length === 0 ? <li className="p-4 text-sm text-muted">No clicks yet.</li> : null}
        {recent.map((click) => (
          <li key={click.id} className="flex justify-between gap-4 p-4 text-sm">
            <span>
              {click.product.title} → {click.merchant}
            </span>
            <span className="text-faint">
              {click.source} · {click.createdAt.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
