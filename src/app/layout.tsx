import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import "./globals.css";

/**
 * Previously `force-dynamic`, which meant every route in the app was rendered
 * per request — zero prerendering, a database round trip for every visitor, and
 * a slow first byte on the product pages that carry the SEO.
 *
 * It was needed because this layout read the theme cookie. The pre-paint script
 * below now resolves the theme before paint, so the cookie read is gone and
 * pages can be prerendered and revalidated instead.
 *
 * Routes that genuinely need per-request data still opt out automatically:
 * anything calling cookies()/headers() (all of /admin, blog draft previews) or
 * reading searchParams is dynamic regardless of this setting.
 */
export const revalidate = 300;

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.siteName,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.tagline,
    metadataBase: new URL(siteUrl()),
    manifest: "/manifest.webmanifest",
    themeColor: "#a8842b",
    // Bump ?v= whenever the icon files are regenerated; browsers and social
    // scrapers cache favicons aggressively.
    icons: {
      // /favicon.ico is injected automatically from src/app/favicon.ico with a
      // content hash, so it is deliberately not repeated here.
      icon: [
        { url: "/favicon-32.png?v=4", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png?v=4", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png?v=4", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png?v=4", sizes: "180x180" }],
    },
    // Traffic arrives from Instagram and Facebook, where a link with no image
    // renders as a bare text card. Product pages set their own image; this is
    // the fallback for every other page.
    openGraph: {
      siteName: settings.siteName,
      type: "website",
      title: settings.siteName,
      description: settings.tagline,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: settings.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.tagline,
      images: ["/og-default.jpg"],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${instrument.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint, so there is no flash of the wrong theme even though
          the HTML is now prerendered without knowing the visitor's preference.
          This is what allows the layout to be static.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark");document.cookie="theme="+t+"; path=/; max-age=31536000; samesite=lax"}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
