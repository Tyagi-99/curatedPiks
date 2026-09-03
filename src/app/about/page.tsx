import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About",
  description: "What DealDuniya is, how products are chosen, and how affiliate links work.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const settings = await getSettings();
  const email = settings.contactEmail || "hello@dealduniya.in";

  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-5xl leading-[1.05]">About {settings.siteName}</h1>

        <section className="mt-8 space-y-4 text-muted">
          <h2 className="text-3xl text-text">What DealDuniya is</h2>
          <p>
            DealDuniya is a product-discovery site. When someone comments “link” on an Instagram or Facebook
            post, we send them here — a stable page with photos, a written take, and a button to the retailer.
          </p>
          <p>
            We do not sell the products. We do not ship orders. A purchase is a contract between you and the
            store you check out on.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">Why it exists</h2>
          <p>
            Social comments disappear. A product page does not. The site exists so a reel can point to one URL
            with the pick, the caveats, and the retailer — instead of answering the same question in DMs.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">What we cover</h2>
          <p>
            Tech and gadgets, home and kitchen, health and fitness, fashion and accessories, and beauty — the
            same aisles you will see in the nav. We only publish a page when there is something useful to say
            beyond a price and a buy button.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">How products are discovered</h2>
          <p>
            Most picks start on Instagram or Facebook: a reel, a comment asking for the link, or a message
            asking “what is that?” We shortlist from those questions. We do not scrape a catalogue and publish
            every SKU.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">How we choose products</h2>
          <p>
            A product goes on the site when the listed specs, price band, and typical buyer trade-offs are
            clear enough to write an honest page. Affiliate terms do not decide the shortlist. The full steps
            are on{" "}
            <Link href="/how-we-review" className="text-accent">
              How we review
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">How information is researched</h2>
          <p>
            Pages are written from retailer listings, published specifications, and publicly available customer
            feedback. We do not claim that DealDuniya lab-tests or personally wears every product. If a fact
            is not on the page, treat it as unknown — not as a hidden test result.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">How affiliate links work</h2>
          <p>
            Some buttons are affiliate links. If you buy through them, we may earn a commission at no extra
            cost to you. The complete statement is on our{" "}
            <Link href="/legal/affiliate" className="text-accent">
              Affiliate disclosure
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 space-y-4 text-muted">
          <h2 className="text-3xl text-text">Corrections and contact</h2>
          <p>
            If a spec is wrong, a link is broken, or a price we showed is stale, tell us. Email{" "}
            <a href={`mailto:${email}`} className="text-accent">
              {email}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="text-accent">
              contact form
            </Link>
            . We will correct the page when we can verify the change.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
