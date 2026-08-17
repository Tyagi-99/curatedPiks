import { cache } from "react";
import { DISCLOSURE_COPY } from "./editorial";
import { prisma } from "./prisma";
import { realSocialUrl } from "./urls";

export const SITE_NAME = "DealDuniya";

// Values written by earlier builds (and one value left behind by an audit) that
// should all resolve to the current brand name.
const LEGACY_SITE_NAMES = new Set(["CuratedPicks", "Dealduniya", "dealduniya", "MyRealBrand"]);

const DEFAULTS: Record<string, string> = {
  siteName: SITE_NAME,
  tagline: "Buy all the products you've seen in my Instagram videos.",
  disclosure: DISCLOSURE_COPY,
  adsenseClient: "",
  instagramUrl: "",
  facebookUrl: "",
  contactEmail: "hello@dealduniya.in",
  whatsappUrl: "",
};

// Header, Footer, and the page itself all read settings. Without cache() that
// is three identical queries on every dynamically rendered request.
export const getSettings = cache(async () => {
  try {
    const rows = await prisma.setting.findMany();
    const map = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    if (!map.siteName || LEGACY_SITE_NAMES.has(map.siteName)) map.siteName = SITE_NAME;
    map.instagramUrl = realSocialUrl(map.instagramUrl) ?? "";
    map.facebookUrl = realSocialUrl(map.facebookUrl) ?? "";
    return map;
  } catch {
    return { ...DEFAULTS };
  }
});

export async function getSetting(key: string) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function setSettings(values: Record<string, string>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}
