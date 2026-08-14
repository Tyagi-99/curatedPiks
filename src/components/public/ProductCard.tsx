import Link from "next/link";
import { formatInr, discountPercent } from "@/lib/money";

export type ProductCardProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  priceInr: number;
  compareAtInr: number | null;
  imageUrl: string;
  amazonUrl?: string;
  flipkartUrl?: string;
  category?: { name: string };
};

export function ProductCard({
  product,
  source = "bio",
  showBuy = false,
}: {
  product: ProductCardProduct;
  source?: string;
  showBuy?: boolean;
}) {
  const off = discountPercent(product.priceInr, product.compareAtInr);
  const detailHref = `/p/${product.slug}?src=${source}`;

  return (
    <article className="flex flex-col overflow-hidden border border-line bg-surface">
      <Link href={detailHref} className="relative block aspect-[4/5] bg-bg">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center font-display text-5xl text-faint" aria-hidden>
            ∎
          </span>
        )}
        {off ? (
          <span className="absolute left-3 top-3 bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
            -{off}%
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? <span className="text-xs uppercase tracking-wide text-tube">{product.category.name}</span> : null}
        <h3 className="font-display text-2xl leading-tight">
          <Link href={detailHref} className="hover:text-accent">
            {product.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
          {product.description || product.shortDescription}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-semibold">{formatInr(product.priceInr)}</span>
          {product.compareAtInr ? (
            <span className="text-sm text-faint line-through">{formatInr(product.compareAtInr)}</span>
          ) : null}
        </div>
        {showBuy ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {product.amazonUrl ? (
              <a
                href={`/go/${product.id}/amazon?src=${source}`}
                rel="sponsored nofollow noopener"
                className="bg-[#ff9900] px-2 py-2 text-center text-xs font-semibold text-black"
              >
                Amazon
              </a>
            ) : null}
            {product.flipkartUrl ? (
              <a
                href={`/go/${product.id}/flipkart?src=${source}`}
                rel="sponsored nofollow noopener"
                className="bg-[#2874f0] px-2 py-2 text-center text-xs font-semibold text-white"
              >
                Flipkart
              </a>
            ) : null}
            <Link href={detailHref} className="col-span-2 border border-line py-2 text-center text-xs font-medium">
              Full review
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
