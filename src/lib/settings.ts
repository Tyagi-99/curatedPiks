import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  siteName: "CuratedPicks",
  tagline: "Buy all the products you've seen in my Instagram videos.",
  disclosure:
    "Some links are affiliate links — I may earn a small commission at no extra cost to you.",
  adsenseClient: "",
  instagramUrl: "https://instagram.com/",
  facebookUrl: "",
  contactEmail: "hello@curatedpicks.com",
  whatsappUrl: "",
};

export async function getSettings() {
  try {
    const rows = await prisma.setting.findMany();
    const map = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
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
