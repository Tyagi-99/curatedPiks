import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { SiteShell } from "@/components/public/SiteShell";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Suggest a product, report a broken link, or ask a question.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings.contactEmail || "hello@dealduniya.in";
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
          ) : null}
        </div>

        <ContactForm />
      </div>
    </SiteShell>
  );
}
