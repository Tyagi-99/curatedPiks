import { redirect } from "next/navigation";
import { adminPath } from "@/lib/adminPath";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubscribersPage() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  if (user.role !== "ADMIN") {
    return <p>Only an admin can view the newsletter list.</p>;
  }
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,source,createdAt", ...subscribers.map((s) => `${s.email},${s.source},${s.createdAt.toISOString()}`)].join("\n");
  return (
    <div>
      <h1 className="font-display text-3xl">Newsletter</h1>
      <p className="mt-2 text-sm text-muted">{subscribers.length} emails. Export is below (copy the CSV).</p>
      <ul className="mt-6 rounded-2xl bg-surface p-4 text-sm">
        {subscribers.map((s) => (
          <li key={s.id} className="border-b border-line py-2 last:border-0">
            {s.email}
          </li>
        ))}
        {subscribers.length === 0 ? <li className="text-muted">None yet.</li> : null}
      </ul>
      <pre className="mt-6 overflow-auto rounded-xl bg-gray-900 p-3 text-xs text-white">{csv}</pre>
    </div>
  );
}
