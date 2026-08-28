"use client";

import { useEffect, useRef } from "react";

/**
 * One AdSense placement.
 *
 * Slot IDs are real numeric values from your AdSense dashboard and come from
 * env, not from code — the previous version shipped placeholders ("1111111111")
 * that could never fill. If either the publisher ID or the slot ID is missing
 * this renders nothing at all, rather than a dashed "ad space" box.
 *
 * Note: no page mounts this component yet. Ads change page layout, so where
 * they go is a deliberate decision; drop <AdSlot placement="footer" /> into a
 * page when you are ready.
 */
const SLOTS: Record<"after-cta" | "footer", string | undefined> = {
  "after-cta": process.env.NEXT_PUBLIC_ADSENSE_SLOT_AFTER_CTA,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
};

export function AdSlot({ placement }: { placement: "after-cta" | "footer" }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = SLOTS[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch (error) {
      // A blocked or failed ad must never break the page around it.
      console.error("AdSense push failed", error);
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className="min-h-[90px] bg-surface">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
