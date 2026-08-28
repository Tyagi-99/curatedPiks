import Script from "next/script";

/**
 * Loads the AdSense library. Without this, `<ins class="adsbygoogle">` elements
 * never render anything — which is why ad slots were silently blank even with a
 * publisher ID configured.
 *
 * Renders nothing unless NEXT_PUBLIC_ADSENSE_CLIENT is set, so no third-party
 * script is requested until you deliberately opt in.
 */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;

  return (
    <Script
      id="adsbygoogle-lib"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
    />
  );
}
