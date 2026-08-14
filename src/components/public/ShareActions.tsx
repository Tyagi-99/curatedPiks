"use client";

import { useState } from "react";

export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copy();
  }

  return (
    <div className="flex gap-2">
      <button type="button" onClick={share} className="rounded-full border border-line px-4 py-2 text-sm">
        Share
      </button>
      <button type="button" onClick={copy} className="rounded-full border border-line px-4 py-2 text-sm">
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
