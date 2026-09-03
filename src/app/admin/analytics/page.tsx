import { redirect } from "next/navigation";
import { adminPath } from "@/lib/adminPath";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  const [byProduct, bySource, byMerchant] = await Promise.all([
    prisma.click.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.click.groupBy({
      by: ["source"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.click.groupBy({
      by: ["merchant"],
      _count: { id: true },
    }),
  ]);

  const products = await prisma.product.findMany({
    where: { id: { in: byProduct.map((row) => row.productId) } },
  });
  const names = Object.fromEntries(products.map((product) => [product.id, product.title]));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Buy clicks</h1>
      <p className="mt-1 text-sm text-muted">Real outbound clicks recorded by /go/. Empty until someone uses a buy button.</p>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="font-medium">By source</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {bySource.map((row) => (
            <li key={row.source} className="flex justify-between">
              <span>{row.source}</span>
              <span>{row._count.id}</span>
            </li>
          ))}
          {bySource.length === 0 ? <li className="text-muted">No data yet.</li> : null}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-4">
        <h2 className="font-medium">By retailer</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {byMerchant.map((row) => (
            <li key={row.merchant} className="flex justify-between">
              <span>{row.merchant}</span>
              <span>{row._count.id}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-4">
        <h2 className="font-medium">By product</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {byProduct.map((row) => (
            <li key={row.productId} className="flex justify-between">
              <span>{names[row.productId] ?? row.productId}</span>
              <span>{row._count.id}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
