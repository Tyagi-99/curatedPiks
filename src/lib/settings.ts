import { DISCLOSURE_COPY } from "./editorial";
import { prisma } from "./prisma";
import { realSocialUrl } from "./urls";

const DEFAULTS: Record<string, string> = {
  siteName: "CuratedPicks",
  tagline: "Buy all the products you've seen in my Instagram videos.",
  disclosure: DISCLOSURE_COPY,
  adsenseClient: "",
  instagramUrl: "",
  facebookUrl: "",
  contactEmail: "hello@curatedpicks.com",
  whatsappUrl: "",
};

export async function getSettings() {
  try {
    const rows = await prisma.setting.findMany();
    const map = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    map.instagramUrl = realSocialUrl(map.instagramUrl) ?? "";
    map.facebookUrl = realSocialUrl(map.facebookUrl) ?? "";
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

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
