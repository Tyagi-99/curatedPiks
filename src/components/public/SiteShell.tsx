import { DisableInspect } from "./DisableInspect";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisableInspect />
      {/* WCAG 2.4.1: let keyboard users jump the nav. Hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-text focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
