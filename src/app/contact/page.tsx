import type { Metadata } from "next";
import { SiteShell } from "@/components/public/SiteShell";
import { submitContact } from "@/app/actions/public";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings.contactEmail || "hello@curatedpicks.com";
  const whatsapp = settings.whatsappUrl;

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm text-tube">We read every message</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">Contact</h1>
        <p className="mt-3 text-muted">
          Suggest a product, report a broken link, or talk partnership. Email and WhatsApp will sit here — the form
          already works.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${email}`}
            className="border border-line bg-surface p-4 hover:border-accent"
          >
            <p className="text-xs uppercase tracking-wide text-faint">Email</p>
            <p className="mt-1 font-medium">{email}</p>
          </a>
          {whatsapp ? (
            <a href={whatsapp} className="border border-line bg-surface p-4 hover:border-accent">
              <p className="text-xs uppercase tracking-wide text-faint">WhatsApp</p>
              <p className="mt-1 font-medium">Chat with us</p>
            </a>
          ) : (
            <div className="border border-dashed border-line bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-faint">WhatsApp</p>
              <p className="mt-1 text-sm text-muted">Coming soon</p>
            </div>
          )}
        </div>

        <form action={submitContact} className="mt-10 space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input name="name" required className="mt-1 w-full border border-line px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required className="mt-1 w-full border border-line px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Subject
            <select name="subject" className="mt-1 w-full border border-line px-3 py-2">
              <option value="general">General</option>
              <option value="review">Suggest a product</option>
              <option value="partnership">Partnership</option>
              <option value="bug">Broken link</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Message
            <textarea name="body" required minLength={10} rows={5} className="mt-1 w-full border border-line px-3 py-2" />
          </label>
          <button type="submit" className="bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover">
            Send message
          </button>
        </form>
      </div>
    </SiteShell>
  );
}
