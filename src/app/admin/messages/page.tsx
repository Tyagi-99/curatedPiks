import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Inbox</h1>
      <ul className="mt-6 space-y-3">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-surface p-4">
            <div className="text-sm font-medium">
              {message.name} · {message.email} · {message.subject}
            </div>
            <p className="mt-2 text-sm text-muted">{message.body}</p>
            <p className="mt-2 text-xs text-faint">{message.createdAt.toLocaleString("en-IN")}</p>
          </li>
        ))}
        {messages.length === 0 ? <li className="text-sm text-muted">No messages.</li> : null}
      </ul>
    </div>
  );
}
