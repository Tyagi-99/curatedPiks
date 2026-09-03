import Link from "next/link";
import { redirect } from "next/navigation";
import { adminPath } from "@/lib/adminPath";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostsAdminPage() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Blog</h1>
        <Link href={adminPath("posts/new")} className="rounded-full bg-cta px-4 py-2 text-sm font-semibold text-cta-ink">
          New post
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">Guides and longer notes. Published posts appear on /blog and in the sitemap.</p>
      <ul className="mt-6 divide-y divide-line rounded-2xl bg-surface">
        {posts.map((post) => (
          <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="mt-1 text-faint">
                {post.status === "PUBLISHED" && post.publishedAt
                  ? `Published ${post.publishedAt.toLocaleDateString("en-IN")}`
                  : "Draft"}
                {" · "}
                updated {post.updatedAt.toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex gap-3">
              {post.status === "PUBLISHED" ? (
                <Link href={`/blog/${post.slug}`} className="text-muted">
                  View
                </Link>
              ) : (
                <Link href={`/blog/${post.slug}`} className="text-muted">
                  Preview
                </Link>
              )}
              <Link href={adminPath(`posts/${post.id}`)} className="font-medium">
                Edit
              </Link>
            </div>
          </li>
        ))}
        {posts.length === 0 ? <li className="p-4 text-sm text-muted">No posts yet.</li> : null}
      </ul>
    </div>
  );
}
