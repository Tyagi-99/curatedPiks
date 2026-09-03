import { ProductForm } from "@/components/admin/ProductForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/adminPath";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">New product</h1>
      <ProductForm categories={categories} canEditLinks={user.role === "ADMIN"} />
    </div>
  );
}
