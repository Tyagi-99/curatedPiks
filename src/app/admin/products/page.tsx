import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/adminPath";
import { prisma } from "@/lib/prisma";
import { formatInr, showCompareAt } from "@/lib/money";

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; store?: string; status?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  const { q = "", store = "all", status = "all" } = await searchParams;
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { clicks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const needle = q.trim().toLowerCase();
  const shown = products.filter((product) => {
    if (store !== "all" && (product.store || "") !== store) return false;
    if (status === "live" && !product.published) return false;
    if (status === "draft" && product.published) return false;
    if (needle && !`${product.title} ${product.category.name}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const stores = [...new Set(products.map((p) => p.store).filter(Boolean))] as string[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{shown.length} products</p>
        <Link href={adminPath("products/new")} className="rounded-full bg-cta px-4 py-2 text-sm font-semibold text-cta-ink">
          Add product
        </Link>
      </div>
      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <label className="sr-only" htmlFor="product-q">
          Search products
        </label>
        <input
          id="product-q"
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="min-w-[12rem] flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm"
        />
        <select name="store" defaultValue={store} className="rounded-full border border-line bg-surface px-3 py-2 text-sm">
          <option value="all">All stores</option>
          {stores.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="rounded-full border border-line bg-surface px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="live">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="rounded-full border border-line px-4 py-2 text-sm">Filter</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-faint">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Store</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{product.title}</td>
                <td className="p-3 text-muted">{product.store || "—"}</td>
                <td className="p-3 text-muted">{product.category.name}</td>
                <td className="p-3 tabular-nums">
                  {formatInr(product.priceInr)}
                  {showCompareAt(product.priceInr, product.compareAtInr) && product.compareAtInr ? (
                    <span className="ml-2 text-faint line-through">{formatInr(product.compareAtInr)}</span>
                  ) : null}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      product.published ? "bg-success-soft text-success" : "bg-surface-muted text-muted"
                    }`}
                  >
                    {product.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 tabular-nums">{product._count.clicks}</td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link href={`/p/${product.slug}`} className="text-muted">
                      Preview
                    </Link>
                    <Link href={adminPath(`products/${product.id}`)} className="font-medium">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td className="p-4 text-muted" colSpan={7}>
                  No products match that filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
