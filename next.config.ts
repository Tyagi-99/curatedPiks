import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // hostname: "**" turned the image optimiser into an open proxy: anyone
    // could pass /_next/image?url=<any https host> and use this deployment to
    // fetch and re-serve arbitrary remote content on our bandwidth.
    //
    // Only images.unsplash.com is currently referenced by the catalogue; the
    // retailer CDNs are listed so pasted product images keep working. Add a
    // host here if the admin starts using a new source.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "rukminim1.flixcart.com" },
      { protocol: "https", hostname: "rukminim2.flixcart.com" },
      { protocol: "https", hostname: "assets.myntassets.com" },
      { protocol: "https", hostname: "assets.ajio.com" },
      { protocol: "https", hostname: "images-static.nykaa.com" },
      { protocol: "https", hostname: "images.meesho.com" },
    ],
  },
  // dev.db was a leftover from the SQLite era; the app runs on Postgres now and
  // the file is gitignored, so tracing it into every function did nothing.
  outputFileTracingIncludes: {
    "/**": ["./prisma/schema.prisma"],
  },
  async redirects() {
    return [
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      { source: "/cookies", destination: "/legal/cookies", permanent: true },
      { source: "/affiliate-disclosure", destination: "/legal/affiliate", permanent: true },
    ];
  },
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    const adsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
      ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com"
      : "";

    // Honest scope note: script-src includes 'unsafe-inline' because Next
    // injects inline hydration scripts and the pre-paint theme script runs
    // inline. Removing it needs per-request nonce plumbing, which proxy.ts
    // cannot do while it may run on a CDN edge. The directives below are still
    // worth setting: object-src, base-uri and frame-ancestors close real
    // attack surface regardless of inline script policy.
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}${adsense}`,
      "style-src 'self' 'unsafe-inline'",
      // Product images are pasted by the admin from arbitrary retailer CDNs.
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src 'self'${dev ? " ws: wss:" : ""}${adsense}`,
      `frame-src 'self'${adsense}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Clickjacking: nothing here is meant to be framed.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Keep the full URL for our own pages but send only the origin to
          // retailers, so affiliate destinations do not receive query strings.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Never let a signed-in admin screen be cached by a shared proxy.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
