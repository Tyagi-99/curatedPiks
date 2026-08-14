export function AdSlot({ slot }: { slot: "after-cta" | "footer" }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) {
    return (
      <div className="border border-dashed border-line bg-surface px-4 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-faint">
        Ad space ({slot}). AdSense appears here after you add a publisher ID in admin settings.
      </div>
    );
  }

  return (
    <div className="min-h-[90px] bg-surface">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot === "after-cta" ? "1111111111" : "2222222222"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
