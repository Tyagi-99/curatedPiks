import { ctaLabel } from "@/lib/editorial";
import { resolveStore } from "@/lib/stores";

type Props = {
  productId: string;
  source: string;
  store?: string | null;
  affiliateUrl?: string | null;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  networkUrl?: string | null;
  sticky?: boolean;
};

export function BuyButtons({
  productId,
  source,
  store,
  affiliateUrl,
  amazonUrl,
  flipkartUrl,
  networkUrl,
  sticky = false,
}: Props) {
  const resolved = resolveStore({ store, affiliateUrl, amazonUrl, flipkartUrl, networkUrl });

  if (!resolved.url) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">Buy links will appear here once they are added.</p>
      </div>
    );
  }

  return (
    <div className={sticky ? "sticky bottom-3 z-30" : undefined}>
      <div className="rounded-3xl border border-line bg-surface/95 p-4 shadow-lg backdrop-blur">
        <p className="mb-3 text-sm text-muted">Available on {resolved.label}</p>
        <a
          href={`/go/${productId}/${resolved.id}?src=${encodeURIComponent(source)}`}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className={`block rounded-full px-5 py-3.5 text-center text-base font-semibold ${resolved.buttonClass}`}
        >
          {ctaLabel(resolved.label, resolved.id)}
        </a>
      </div>
    </div>
  );
}
