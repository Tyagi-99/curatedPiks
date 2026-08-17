"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Without this, a failed render or database error showed the framework's
 * default error screen. Styling mirrors not-found.tsx so the page still looks
 * like the rest of the site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="text-sm text-muted">Something went wrong</p>
      <h1 className="mt-2 text-5xl leading-[1.05]">We hit a snag</h1>
      <p className="mt-4 text-muted">
        This page could not load. Try again in a moment — the products and buy links are unaffected.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-faint">Reference: {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-bg"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-line px-5 py-3 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
