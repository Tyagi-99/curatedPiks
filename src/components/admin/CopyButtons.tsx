"use client";

import { useState } from "react";

export function CopyButtons({ items }: { items: { label: string; value: string }[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => copy(item.label, item.value)}
          className="rounded-full border border-line px-3 py-1 text-xs"
        >
          {copied === item.label ? "Copied" : `Copy ${item.label}`}
        </button>
      ))}
    </div>
  );
}
