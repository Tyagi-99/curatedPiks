"use client";

import { useEffect } from "react";

/**
 * Keeps `?src=` attribution working on prerendered pages.
 *
 * The product page used to read `searchParams.src` on the server, which forced
 * every product page to render per request. Reading it here instead lets those
 * pages be prerendered while still recording where a visitor came from.
 *
 * Without JavaScript the link keeps its server-rendered default source, so the
 * buy button always works — attribution degrades, the sale does not.
 */
export function PreserveClickSource() {
  useEffect(() => {
    const src = new URLSearchParams(window.location.search).get("src");
    if (!src) return;
    const clean = src.slice(0, 32);

    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="/go/"]')) {
      try {
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set("src", clean);
        link.href = url.pathname + url.search;
      } catch {
        /* leave the link untouched rather than breaking it */
      }
    }
  }, []);

  return null;
}
