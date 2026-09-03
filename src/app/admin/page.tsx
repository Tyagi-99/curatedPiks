import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/adminPath";
import { redirect } from "next/navigation";

export default async function AdminHome() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));

  const [products, published, drafts, clicks, messages, posts, subscribers] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { published: false } }),
    prisma.click.count(),
    user.role === "ADMIN" ? prisma.message.count({ where: { read: false } }) : Promise.resolve(0),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    user.role === "ADMIN" ? prisma.subscriber.count() : Promise.resolve(0),
  ]);

  const [recentClicks, recentProducts, recentPosts, recentMail] = await Promise.all([
    prisma.click.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true } } },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, published: true, updatedAt: true },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    user.role === "ADMIN"
      ? prisma.message.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, subject: true, read: true, createdAt: true },
        })
      : Promise.resolve([]),
  ]);

  const metrics: { label: string; value: number; href: string }[] = [
    { label: "Products", value: products, href: adminPath("products") },
    { label: "Published", value: published, href: adminPath("products") },
    { label: "Drafts", value: drafts, href: adminPath("products") },
    { label: "Buy clicks", value: clicks, href: adminPath("analytics") },
    { label: "Articles", value: posts, href: adminPath("posts") },
  ];
  if (user.role === "ADMIN") {
    metrics.push(
      { label: "Unread mail", value: messages, href: adminPath("messages") },
      { label: "Subscribers", value: subscribers, href: adminPath("subscribers") },
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted">Publish a product, copy the Instagram reply, paste under the comment.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className="rounded-xl border border-line bg-surface p-4 hover:border-text">
            <div className="text-sm text-faint">{metric.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{metric.value}</div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={adminPath("products/new")} className="rounded-full bg-cta px-4 py-2 text-sm font-semibold text-cta-ink">
          Add product
        </Link>
        <Link href={adminPath("posts/new")} className="rounded-full border border-line px-4 py-2 text-sm">
          Write article
        </Link>
        {user.role === "ADMIN" ? (
          <Link href={adminPath("messages")} className="rounded-full border border-line px-4 py-2 text-sm">
            Inbox
          </Link>
        ) : null}
      </div>
      <section>
        <h2 className="font-display text-2xl">Latest outbound clicks</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
          {recentClicks.length === 0 ? <li className="p-4 text-sm text-muted">No clicks yet.</li> : null}
          {recentClicks.map((click) => (
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
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl">Recent products</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {recentProducts.map((product) => (
              <li key={product.id} className="flex justify-between gap-3 p-4 text-sm">
                <Link href={adminPath(`products/${product.id}`)} className="font-medium hover:underline">
                  {product.title}
                </Link>
                <span className="text-faint">{product.published ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">Recent articles</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {recentPosts.length === 0 ? <li className="p-4 text-sm text-muted">No articles yet.</li> : null}
            {recentPosts.map((post) => (
              <li key={post.id} className="flex justify-between gap-3 p-4 text-sm">
                <Link href={adminPath(`posts/${post.id}`)} className="font-medium hover:underline">
                  {post.title}
                </Link>
                <span className="text-faint">{post.status === "PUBLISHED" ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {user.role === "ADMIN" ? (
        <section>
          <h2 className="font-display text-2xl">Inbox</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {recentMail.length === 0 ? <li className="p-4 text-sm text-muted">No messages.</li> : null}
            {recentMail.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 p-4 text-sm">
                <span>
                  {item.name} · {item.subject}
                  {item.read ? null : <span className="ml-2 text-xs text-danger">Unread</span>}
                </span>
                <span className="text-faint">{item.createdAt.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
