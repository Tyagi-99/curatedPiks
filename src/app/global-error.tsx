"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Last resort: catches errors thrown in the root layout itself, where error.tsx
 * cannot render because the layout never mounted. Must supply html/body.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error("Root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f6f3",
          color: "#111111",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontWeight: 400, fontSize: "2rem", margin: 0 }}>We hit a snag</h1>
          <p style={{ color: "#5c5c5c" }}>
            The site could not load. Please refresh, or try again shortly.
          </p>
          <Link href="/" style={{ color: "#111111" }}>
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
