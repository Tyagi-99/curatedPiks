type Props = {
  productId: string;
  source: string;
  amazonUrl?: string;
  flipkartUrl?: string;
  networkUrl?: string;
  sticky?: boolean;
};

export function BuyButtons({
  productId,
  source,
  amazonUrl,
  flipkartUrl,
  networkUrl,
  sticky = false,
}: Props) {
  const buttons = [
    amazonUrl
      ? { merchant: "amazon", label: "Buy on Amazon", className: "bg-[#ff9900] text-black hover:bg-[#e88b00]" }
      : null,
    flipkartUrl
      ? { merchant: "flipkart", label: "Buy on Flipkart", className: "bg-[#2874f0] text-white hover:bg-[#1c5dc9]" }
      : null,
    networkUrl
      ? { merchant: "network", label: "See best price", className: "bg-text text-bg hover:opacity-90" }
      : null,
  ].filter(Boolean) as { merchant: string; label: string; className: string }[];

  if (buttons.length === 0) {
    return (
      <div className="ticket p-4">
        <p className="text-sm text-muted">Buy links will appear here once they are added.</p>
      </div>
    );
  }

  return (
    <div className={sticky ? "sticky bottom-3 z-30" : undefined}>
      <div className="ticket px-4 pb-4 pt-5">
        <p className="mb-3 text-xs text-faint">Buy from a store you trust</p>
        <div className="grid gap-2">
          {buttons.map((button) => (
            <a
              key={button.merchant}
              href={`/go/${productId}/${button.merchant}?src=${encodeURIComponent(source)}`}
              rel="sponsored nofollow noopener"
              className={`block px-5 py-3 text-center text-base font-semibold ${button.className}`}
            >
              {button.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
