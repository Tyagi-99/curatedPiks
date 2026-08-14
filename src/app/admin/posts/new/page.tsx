import { savePost } from "@/app/actions/admin";

export default function NewPostPage() {
  return (
    <form action={savePost} className="max-w-2xl space-y-4">
      <h1 className="font-serif text-3xl">New post</h1>
      <input name="title" required placeholder="Title" className="w-full rounded-xl border border-line px-3 py-2" />
      <input name="slug" placeholder="slug" className="w-full rounded-xl border border-line px-3 py-2" />
      <input name="excerpt" placeholder="Short excerpt" className="w-full rounded-xl border border-line px-3 py-2" />
      <textarea name="body" rows={12} placeholder="Body" className="w-full rounded-xl border border-line px-3 py-2" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" /> Publish
      </label>
      <button className="rounded-full bg-gray-900 px-4 py-2 text-white">Save</button>
    </form>
  );
}
