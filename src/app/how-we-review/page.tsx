import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/public/SiteShell";

export const metadata: Metadata = {
  title: "How we review",
  description: "How DealDuniya discovers, researches, and updates product pages — and how affiliate links do not decide the shortlist.",
  alternates: { canonical: "/how-we-review" },
};

const STEPS = [
  {
    title: "1. Product discovery",
    body: "A pick usually starts on Instagram or Facebook: a reel, a comment asking for the link, or a repeated question in messages. We do not publish every product that appears in a video.",
  },
  {
    title: "2. Product research",
    body: "We read the retailer listing, the published specifications, and publicly available customer feedback. We do not claim an in-house lab test or a personal wear-test unless that is written on the page.",
  },
  {
    title: "3. Feature comparison",
    body: "We compare the listed features with other products already on DealDuniya in the same category. Alternatives on a page are other published picks, not invented competitors.",
  },
  {
    title: "4. Value assessment",
    body: "We look at the listed price band against what the product claims to do. A lower price is not automatically a recommendation. A higher price is not automatically quality.",
  },
  {
    title: "5. Pros and cons",
    body: "Pros and cons come from the listing and from typical trade-offs for that type of product (size, noise, missing ports). We do not invent a weakness to look balanced, and we do not hide a listed limitation.",
  },
  {
    title: "6. Alternatives",
    body: "Where we have other published products in the same category, we show two to four of them. If the aisle is thin, we show what we have — we do not pad the page with unrelated items.",
  },
  {
    title: "7. Price and availability checks",
    body: "Prices on DealDuniya are entered by hand and can change. Every product page says to check the retailer for the latest price. The “last updated” line is the last time we edited that price.",
  },
  {
    title: "8. Editorial updates",
    body: "We update a page when a listing changes, a link breaks, or someone sends a correction we can verify. UpdatedAt and the price-checked date are the record of that work.",
  },
  {
    title: "9. Corrections",
    body: "If something on a page is wrong, use the contact form or email hello@dealduniya.in. Affiliate relationships do not decide what we recommend, and they do not stop us correcting a page.",
  },
];

export default function HowWeReviewPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-5xl leading-[1.05]">How DealDuniya reviews and curates products</h1>
        <p className="mt-4 text-muted">
          Affiliate programmes do not decide the shortlist. A retailer paying a commission is not a reason to
          feature a product — or to hide a limitation.
        </p>
        <div className="mt-10 space-y-8">
          {STEPS.map((step) => (
            <section key={step.title}>
              <h2 className="text-3xl">{step.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted">
          Questions or a correction:{" "}
          <Link href="/contact" className="text-accent">
            contact us
          </Link>
          . How we are paid is on the{" "}
          <Link href="/legal/affiliate" className="text-accent">
            affiliate disclosure
          </Link>
          .
        </p>
      </article>
    </SiteShell>
  );
}
