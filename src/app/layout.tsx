import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Instrument_Serif, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = (await cookies()).get("theme")?.value;
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${instrument.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint. The class is already correct for visitors who have
          a theme cookie; this covers the first visit, where the stored or OS
          preference would otherwise be ignored until the second toggle click.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark");document.cookie="theme="+t+"; path=/; max-age=31536000; samesite=lax"}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
