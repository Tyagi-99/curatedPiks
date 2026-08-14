import type { Metadata } from "next";
import { SiteShell } from "@/components/public/SiteShell";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-tube">Who we are</p>
        <h1 className="mt-2 text-5xl leading-[1.05]">About {settings.siteName}</h1>
        <p className="mt-4 text-muted">
          We review products and publish a short, useful page for each one — photos, what works, what does not, and a
          buy button for Amazon or Flipkart.
        </p>
        <p className="mt-4 text-muted">
          We do not invent reader counts or fake ratings. How we work with retailers is explained on our{" "}
          <a href="/legal/affiliate" className="text-accent">
            Affiliate disclosure
          </a>{" "}
          page.
        </p>
      </div>
    </SiteShell>
  );
}
