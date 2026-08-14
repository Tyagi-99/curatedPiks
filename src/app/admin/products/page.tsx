import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/money";

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { clicks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          New product
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-faint">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Store</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Clicks</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{product.title}</td>
                <td className="p-3 text-muted">{product.store || "—"}</td>
                <td className="p-3 text-muted">{product.category.name}</td>
                <td className="p-3">{formatInr(product.priceInr)}</td>
                <td className="p-3">
                  {product.published ? "Live" : "Draft"}
                  {product.pinnedToBio ? " · bio" : ""}
                </td>
                <td className="p-3">{product._count.clicks}</td>
                <td className="p-3">
                  <Link href={`/admin/products/${product.id}`} className="text-accent">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
