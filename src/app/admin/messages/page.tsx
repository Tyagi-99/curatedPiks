import { redirect } from "next/navigation";
import { deleteMessage, markMessageRead } from "@/app/actions/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") {
    return <p>Only an admin can read contact messages.</p>;
  }
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Inbox</h1>
      <ul className="mt-6 space-y-3">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-surface p-4">
            <div className="text-sm font-medium">
              {message.name} · {message.email} · {message.subject}
              {message.read ? null : <span className="ml-2 text-xs text-danger">Unread</span>}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{message.body}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-faint">{message.createdAt.toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-3">
                {message.read ? null : (
                  <form action={markMessageRead}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className="text-xs text-accent">
                      Mark read
                    </button>
                  </form>
                )}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={message.id} />
                  <button type="submit" className="text-xs text-danger">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
        {messages.length === 0 ? <li className="text-sm text-muted">No messages.</li> : null}
      </ul>
    </div>
  );
}
