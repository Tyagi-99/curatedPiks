import { DisableInspect } from "./DisableInspect";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisableInspect />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
