import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
    return [
      {
        source: "/:path*",
        headers: [
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
