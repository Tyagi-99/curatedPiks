import Link from "next/link";
import { discountPercent, formatInr } from "@/lib/money";
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
  category?: { name: string; slug?: string };
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
  const off = discountPercent(product.priceInr, product.compareAtInr);
  const store = resolveStore(product);
  const detailHref = `/p/${product.slug}?src=${source}`;
  const buyHref = store.url ? `/go/${product.id}/${store.id}?src=${encodeURIComponent(source)}` : detailHref;

  if (compact) {
    return (
      <Link href={detailHref} className="group flex gap-3 rounded-2xl border border-line bg-surface p-3 lift-card">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-bg">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover img-zoom" />
          ) : null}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium">{product.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_8px_30px_rgb(17_17_17/0.04)] lift-card">
      <Link href={detailHref} className="relative block aspect-[4/5] overflow-hidden bg-bg">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover img-zoom"
            loading="lazy"
          />
        ) : (
          <span className="grid h-full place-items-center font-display text-5xl text-faint" aria-hidden>
            ∎
          </span>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${store.badgeClass}`}>
          {store.label}
        </span>
        {off ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white">
            {off}% off
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-2xl leading-tight">
          <Link href={detailHref} className="hover:opacity-70">
            {product.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{product.shortDescription}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-semibold">{formatInr(product.priceInr)}</span>
          {product.compareAtInr ? (
            <span className="text-sm text-faint line-through">{formatInr(product.compareAtInr)}</span>
          ) : null}
        </div>
        {store.url ? (
          <>
            <p className="text-sm text-muted">Available on {store.label}</p>
            <a
              href={buyHref}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className={`mt-auto block rounded-full px-4 py-3 text-center text-sm font-semibold ${store.buttonClass}`}
            >
              Buy on {store.label}
            </a>
          </>
        ) : (
          <Link href={detailHref} className="mt-auto rounded-full border border-line py-3 text-center text-sm">
            View product
          </Link>
        )}
      </div>
    </article>
  );
}
