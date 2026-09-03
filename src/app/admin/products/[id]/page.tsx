import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminPath } from "@/lib/adminPath";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">Edit product</h1>
      <ProductForm product={product} categories={categories} canEditLinks={user.role === "ADMIN"} />
    </div>
  );
}
