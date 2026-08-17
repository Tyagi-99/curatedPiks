import { redirect } from "next/navigation";
import { saveRedirect } from "@/app/actions/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RedirectsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") {
    return <p>Only an admin can manage redirects.</p>;
  }
  const redirects = await prisma.redirect.findMany();
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl">Redirects</h1>
      <ul className="mt-4 space-y-2 text-sm">
        {redirects.map((item) => (
          <li key={item.id} className="rounded-xl bg-surface p-3">
            {item.fromPath} → {item.toPath}
          </li>
        ))}
      </ul>
      <form action={saveRedirect} className="mt-6 space-y-3 rounded-2xl bg-surface p-4">
        <input name="fromPath" placeholder="/old-slug" required className="w-full rounded-xl border border-line px-3 py-2" />
        <input name="toPath" placeholder="/p/new-slug" required className="w-full rounded-xl border border-line px-3 py-2" />
        <button className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">Add</button>
      </form>
    </div>
  );
}
