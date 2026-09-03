import Link from "next/link";
import { discountPercent, formatInr, showCompareAt } from "@/lib/money";
import { checkPriceCta, editorialBadge, ratingRow } from "@/lib/productCard";
import { resolveStore } from "@/lib/stores";

export type ProductCardProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  priceInr: number;
  compareAtInr: number | null;
  imageUrl: string;
  store?: string | null;
  affiliateUrl?: string | null;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  networkUrl?: string | null;
  quickVerdict?: string;
  category?: { name: string; slug?: string };
  pinnedToBio?: boolean;
  popular?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
};

export function ProductCard({
  product,
  source = "bio",
  compact = false,
}: {
  product: ProductCardProduct;
  source?: string;
  compact?: boolean;
}) {
  const compare = showCompareAt(product.priceInr, product.compareAtInr);
  const off = discountPercent(product.priceInr, product.compareAtInr);
  const store = resolveStore(product);
  const detailHref = `/p/${product.slug}?src=${source}`;
  const buyHref = store.url ? `/go/${product.id}/${store.id}?src=${encodeURIComponent(source)}` : detailHref;
  const reason = product.quickVerdict || product.shortDescription;
  const pick = editorialBadge(product);
  const rating = ratingRow(product.rating, product.reviewCount);

  if (compact) {
    return (
      <Link href={detailHref} className="group flex gap-3 rounded-2xl border border-line bg-surface p-3 lift-card">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-bg">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" width={64} height={80} className="h-full w-full object-cover img-zoom" />
          ) : null}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium">{product.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{reason}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="product-card group flex h-full flex-col rounded-2xl border border-line bg-surface">
      <Link href={detailHref} className="relative block aspect-[4/5] overflow-hidden rounded-t-2xl bg-bg">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            width={600}
            height={750}
            className="product-card-image h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="grid h-full place-items-center font-display text-5xl text-faint" aria-hidden>
            ∎
          </span>
        )}
        <span className={`pointer-events-none absolute left-3 top-3 z-10 max-w-[46%] truncate ${store.badgeClass}`}>
          {store.label}
        </span>
        {pick ? (
          <span className="editorial-badge pointer-events-none absolute right-3 top-3 z-10 max-w-[46%] truncate">
            {pick}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-2xl leading-tight">
          <Link href={detailHref} className="rounded-sm hover:opacity-70">
            {product.title}
          </Link>
        </h3>
        {rating ? (
          <p className="mt-1.5 text-sm text-muted">
            <span className="text-star" aria-hidden="true">
              ★
            </span>
            {rating.replace(/^★\s*/, " ")}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{reason}</p>
        <div className="flex-1" aria-hidden="true" />
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-semibold tabular-nums tracking-tight">{formatInr(product.priceInr)}</span>
          {compare && product.compareAtInr ? (
            <span className="text-sm text-faint line-through tabular-nums">{formatInr(product.compareAtInr)}</span>
          ) : null}
          {off ? (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">{off}% OFF</span>
          ) : null}
        </div>
        <Link
          href={detailHref}
          className="product-card-review mt-3 inline-flex min-h-9 items-center self-start text-sm font-medium"
        >
          Read the review
          <span aria-hidden="true"> →</span>
          <span className="sr-only"> of {product.title}</span>
        </Link>
        {store.url ? (
          <a
            href={buyHref}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className={`product-card-cta mt-2 block min-h-11 w-full rounded-full px-4 py-3 text-center text-sm font-semibold ${store.buttonClass}`}
          >
            {checkPriceCta(store.label, store.id)}
          </a>
        ) : (
          <Link href={detailHref} className="mt-2 block min-h-11 rounded-full border border-line py-3 text-center text-sm">
            View product
          </Link>
        )}
      </div>
    </article>
  );
}
