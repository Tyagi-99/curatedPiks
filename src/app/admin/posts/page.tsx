import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PostsAdminPage() {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Blog</h1>
        <Link href="/admin/posts/new" className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
          New post
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-line rounded-2xl bg-surface">
        {posts.map((post) => (
          <li key={post.id} className="flex justify-between p-4 text-sm">
            <span>{post.title}</span>
            <Link href={`/admin/posts/${post.id}`} className="text-accent">
              {post.status}
            </Link>
          </li>
        ))}
        {posts.length === 0 ? <li className="p-4 text-sm text-muted">No posts yet.</li> : null}
      </ul>
    </div>
  );
}
