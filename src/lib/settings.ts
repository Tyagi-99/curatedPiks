import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  siteName: "CuratedPicks",
  tagline: "We shortlist products worth buying — then send you to Amazon or Flipkart.",
  disclosure:
    "We may earn a commission if you buy through our Amazon or Flipkart links. You pay the same price.",
  adsenseClient: "",
  instagramUrl: "",
  facebookUrl: "",
  contactEmail: "hello@curatedpicks.com",
  whatsappUrl: "",
};

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map = { ...DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return map;
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
