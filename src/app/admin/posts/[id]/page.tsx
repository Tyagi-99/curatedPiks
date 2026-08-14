import { notFound } from "next/navigation";
import { savePost } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <form action={savePost} className="max-w-2xl space-y-4">
      <h1 className="font-serif text-3xl">Edit post</h1>
      <input type="hidden" name="id" value={post.id} />
      <input name="title" defaultValue={post.title} required className="w-full rounded-xl border border-line px-3 py-2" />
      <input name="slug" defaultValue={post.slug} className="w-full rounded-xl border border-line px-3 py-2" />
      <input name="excerpt" defaultValue={post.excerpt} className="w-full rounded-xl border border-line px-3 py-2" />
      <textarea name="body" rows={12} defaultValue={post.body} className="w-full rounded-xl border border-line px-3 py-2" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post.status === "PUBLISHED"} /> Publish
      </label>
      <button className="rounded-full bg-gray-900 px-4 py-2 text-white">Save</button>
    </form>
  );
}
