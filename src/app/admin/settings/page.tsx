import { saveSettings } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") {
    return <p>Only an admin can change site settings.</p>;
  }
  const settings = await getSettings();
  const pages = await prisma.page.findMany();
  const pageMap = Object.fromEntries(pages.map((page) => [page.slug, page]));

  return (
    <form action={saveSettings} className="max-w-2xl space-y-4">
      <h1 className="font-serif text-3xl">Site settings</h1>
      <label className="block text-sm">
        Site name
        <input name="siteName" defaultValue={settings.siteName} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        Tagline
        <input name="tagline" defaultValue={settings.tagline} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        Affiliate disclosure
        <textarea name="disclosure" rows={3} defaultValue={settings.disclosure} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        AdSense client (ca-pub-…)
        <input name="adsenseClient" defaultValue={settings.adsenseClient} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        Instagram URL
        <input name="instagramUrl" defaultValue={settings.instagramUrl} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        Facebook URL
        <input name="facebookUrl" defaultValue={settings.facebookUrl} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      {(["affiliate", "privacy", "terms", "cookies"] as const).map((slug) => (
        <fieldset key={slug} className="rounded-2xl border border-line p-4">
          <legend className="px-1 text-sm font-medium">/legal/{slug}</legend>
          <input
            name={`pageTitle_${slug}`}
            defaultValue={pageMap[slug]?.title ?? slug}
            className="mt-2 w-full rounded-xl border border-line px-3 py-2"
          />
          <textarea
            name={`pageBody_${slug}`}
            rows={5}
            defaultValue={pageMap[slug]?.body ?? ""}
            className="mt-2 w-full rounded-xl border border-line px-3 py-2"
          />
        </fieldset>
      ))}
      <button className="rounded-full bg-gray-900 px-5 py-2 text-white">Save settings</button>
    </form>
  );
}
