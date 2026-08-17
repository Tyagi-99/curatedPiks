import type { ReactNode } from "react";
import Link from "next/link";
import { BuyButtons } from "@/components/public/BuyButtons";
import { ProductCard, type ProductCardProduct } from "@/components/public/ProductCard";
import { ShareActions } from "@/components/public/ShareActions";
import { DISCLOSURE_COPY, formatUpdated, parseSpecs } from "@/lib/editorial";
import { parseStringList } from "@/lib/json";
import { discountPercent, formatInr } from "@/lib/money";
import { resolveStore } from "@/lib/stores";

export type ReviewProduct = ProductCardProduct & {
  brand: string;
  quickVerdict: string;
  whyFeatured: string;
  highlightsJson: string;
  bestForJson: string;
  notForJson: string;
  finalVerdict: string;
  description: string;
  prosJson: string;
  consJson: string;
  featuresJson: string;
  lastPriceCheckedAt: Date | null;
  ogImageUrl: string;
  category: { name: string; slug: string };
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-3xl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ProductReview({
  product,
  related,
  source,
  shareUrl,
}: {
  product: ReviewProduct;
  related: ProductCardProduct[];
  source: string;
  shareUrl: string;
}) {
  const store = resolveStore(product);
  const off = discountPercent(product.priceInr, product.compareAtInr);
  const images = [product.imageUrl, product.ogImageUrl].filter(
    (value, index, all) => value && all.indexOf(value) === index,
  );
  const highlights = parseStringList(product.highlightsJson);
  const pros = parseStringList(product.prosJson);
  const cons = parseStringList(product.consJson);
  const bestFor = parseStringList(product.bestForJson);
  const notFor = parseStringList(product.notForJson);
  const specs = parseSpecs(product.featuresJson);
  const updated = formatUpdated(product.lastPriceCheckedAt);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 pb-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-text">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/c/${product.category.slug}`} className="hover:text-text">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text">{product.title}</li>
        </ol>
      </nav>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
        {images[0] ? (
          // This is the LCP element on a product page.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={product.title}
            fetchPriority="high"
            decoding="async"
            className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
          />
        ) : (
          <div className="grid aspect-[4/5] place-items-center font-display text-7xl text-faint">∎</div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image}
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-20 w-16 rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${store.badgeClass}`}>{store.label}</span>
        {off ? (
          <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white">{off}% off</span>
        ) : null}
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px]">{product.category.name}</span>
      </div>

      <h1 className="mt-4 text-4xl leading-[0.95] sm:text-5xl">{product.title}</h1>
      {product.brand ? <p className="mt-2 text-sm text-muted">{product.brand}</p> : null}
      {product.shortDescription ? <p className="mt-3 text-muted">{product.shortDescription}</p> : null}

      {product.quickVerdict ? (
        <Section title="Quick verdict">
          <p className="leading-relaxed text-muted">{product.quickVerdict}</p>
        </Section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-3xl">Price and availability</h2>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-semibold">{formatInr(product.priceInr)}</span>
          {product.compareAtInr ? <span className="text-muted line-through">{formatInr(product.compareAtInr)}</span> : null}
        </div>
        <p className="mt-3 text-sm text-muted">
          Prices and availability can change. Check the retailer for the latest price.
        </p>
        {updated ? <p className="mt-1 text-sm text-faint">Last updated: {updated}</p> : null}
      </section>

      <div className="mt-6">
        <BuyButtons
          productId={product.id}
          source={source}
          store={product.store}
          affiliateUrl={product.affiliateUrl}
          amazonUrl={product.amazonUrl}
          flipkartUrl={product.flipkartUrl}
          networkUrl={product.networkUrl}
          sticky
        />
      </div>

      <div className="mt-6">
        <ShareActions url={shareUrl} title={product.title} />
      </div>

      {product.whyFeatured ? (
        <Section title="Why we featured it">
          <p className="leading-relaxed text-muted">{product.whyFeatured}</p>
        </Section>
      ) : null}

      {highlights.length > 0 ? (
        <Section title="Key highlights">
          <ul className="list-disc space-y-1 pl-5 text-muted">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {pros.length > 0 || cons.length > 0 ? (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {pros.length > 0 ? (
            <div className="rounded-3xl border border-line bg-success-soft p-4">
              <h2 className="text-xl">Pros</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {pros.map((item) => (
                  <li key={item}>+ {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {cons.length > 0 ? (
            <div className="rounded-3xl border border-line bg-danger-soft p-4">
              <h2 className="text-xl">Cons</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {cons.map((item) => (
                  <li key={item}>− {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {bestFor.length > 0 ? (
        <Section title="Who should consider it">
          <ul className="list-disc space-y-1 pl-5 text-muted">
            {bestFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {notFor.length > 0 ? (
        <Section title="Who should skip it">
          <ul className="list-disc space-y-1 pl-5 text-muted">
            {notFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {specs.length > 0 ? (
        <Section title="Specifications">
          <dl className="divide-y divide-line border-y border-line">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section title="You might also like">
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} source={source} />
            ))}
          </div>
        </Section>
      ) : null}

      {product.finalVerdict ? (
        <Section title="Final verdict">
          <p className="leading-relaxed text-muted">{product.finalVerdict}</p>
        </Section>
      ) : null}

      <p className="mt-10 text-sm leading-relaxed text-faint">{DISCLOSURE_COPY}</p>
    </article>
  );
}
