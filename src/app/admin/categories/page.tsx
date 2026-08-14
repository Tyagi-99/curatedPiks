import { saveCategory } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl">Categories</h1>
      <ul className="mt-4 space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="rounded-xl bg-surface p-3 text-sm">
            {category.name} · {category._count.products} products · /c/{category.slug}
          </li>
        ))}
      </ul>
      <form action={saveCategory} className="mt-8 space-y-3 rounded-2xl bg-surface p-4">
        <h2 className="font-medium">Add / update by slug</h2>
        <input name="name" placeholder="Name" required className="w-full rounded-xl border border-line px-3 py-2" />
        <input name="slug" placeholder="slug-optional" className="w-full rounded-xl border border-line px-3 py-2" />
        <input name="description" placeholder="Description" className="w-full rounded-xl border border-line px-3 py-2" />
        <button className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">Save</button>
      </form>
    </div>
  );
}
