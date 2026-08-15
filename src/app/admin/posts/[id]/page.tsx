import { notFound, redirect } from "next/navigation";
import { deletePost, savePost } from "@/app/actions/admin";
import { PostEditor } from "@/components/admin/PostEditor";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">Edit post</h1>
      <PostEditor
        canPublish={user.role === "ADMIN"}
        action={savePost}
        deleteAction={user.role === "ADMIN" ? deletePost : undefined}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          coverImageUrl: post.coverImageUrl,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          published: post.status === "PUBLISHED",
        }}
      />
    </div>
  );
}
