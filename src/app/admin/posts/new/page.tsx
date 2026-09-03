import { redirect } from "next/navigation";
import { savePost } from "@/app/actions/admin";
import { adminPath } from "@/lib/adminPath";
import { PostEditor } from "@/components/admin/PostEditor";
import { getSession } from "@/lib/auth";

export default async function NewPostPage() {
  const user = await getSession();
  if (!user) redirect(adminPath("login"));
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">New post</h1>
      <PostEditor canPublish={user.role === "ADMIN"} action={savePost} />
    </div>
  );
}
