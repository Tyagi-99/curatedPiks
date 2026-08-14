import { SiteShell } from "@/components/public/SiteShell";

export default function ThanksPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-4xl">Message received</h1>
        <p className="mt-3 text-muted">Thanks — we will get back to you as soon as we can.</p>
      </div>
    </SiteShell>
  );
}
