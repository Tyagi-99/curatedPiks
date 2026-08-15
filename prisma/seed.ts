import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { LEGAL_PAGES } from "../src/lib/legalPages";
import { EDITORIAL_BY_SLUG } from "./editorialSeed";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

function searchLinks(query: string) {
  const q = encodeURIComponent(query);
  return {
    amazonUrl: `https://www.amazon.in/s?k=${q}`,
    flipkartUrl: `https://www.flipkart.com/search?q=${q}`,
  };
}

export async function seedDatabase(prisma: PrismaClient) {
  const email = (process.env.ADMIN_EMAIL ?? "admin@curatedpicks.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, name: "Admin", role: "ADMIN" },
  });

  const categories = [
    {
      name: "Tech",
      slug: "tech-gadgets",
      description: "Headphones, screens, and daily carry tech we actually use.",
    },
    {
      name: "Home Decor",
      slug: "home-kitchen",
      description: "Lamps, storage, and pieces that earn their counter space.",
    },
    {
      name: "Fitness",
      slug: "health-fitness",
      description: "Mats, weights, and trackers for small-space workouts.",
    },
    {
      name: "Fashion",
      slug: "fashion-accessories",
      description: "Watches, bags, and everyday carry that last.",
    },
    {
      name: "Beauty",
      slug: "beauty",
      description: "Serums, color, and skin picks from the reels.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }

  const bySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.slug, category.id]),
  );

  const products = [
    {
      slug: "airwave-pro-headphones",
      title: "AirWave Pro Headphones",
      shortDescription: "Wireless ANC headphones with a 40-hour battery.",
      description:
        "The pair we send most often after a reel. Strong noise cancelling on a metro, and you will not charge them every night.",
      priceInr: 18999,
      compareAtInr: 24999,
      categoryId: bySlug["tech-gadgets"],
      imageUrl: img("photo-1505740420928-5e560c06d30e"),
      sortOrder: 1,
      pinnedToBio: true,
      ...searchLinks("sony wh-1000xm5 headphones"),
      prosJson: JSON.stringify(["Strong noise cancelling", "About 40 hours between charges", "Comfortable for long sessions"]),
      consJson: JSON.stringify(["Bulky in a small bag", "No wired ANC"]),
    },
    {
      slug: "pixelview-4k-monitor",
      title: "PixelView 4K Monitor",
      shortDescription: "27-inch 4K IPS display with USB-C charging.",
      description:
        "A clean desk screen for editing and work-from-home. USB-C can power a laptop so the cable mess stays small.",
      priceInr: 32999,
      compareAtInr: 39999,
      categoryId: bySlug["tech-gadgets"],
      imageUrl: img("photo-1527443224154-c4a3942d3acf"),
      sortOrder: 2,
      ...searchLinks("27 inch 4k monitor usb-c"),
      prosJson: JSON.stringify(["Sharp 4K text", "USB-C charging", "Height-adjustable stand"]),
      consJson: JSON.stringify(["60Hz only", "No speakers"]),
    },
    {
      slug: "swifttype-mechanical-keyboard",
      title: "SwiftType Mechanical Keyboard",
      shortDescription: "Low-profile wireless mechanical keyboard.",
      description:
        "Hot-swappable switches and a slim body. This is the keyboard we keep in the bag for cafes and shoots.",
      priceInr: 8999,
      compareAtInr: 11999,
      categoryId: bySlug["tech-gadgets"],
      imageUrl: img("photo-1511467687858-23d96c32e4ae"),
      sortOrder: 3,
      ...searchLinks("wireless mechanical keyboard 75 percent"),
      prosJson: JSON.stringify(["Hot-swappable switches", "Tri-mode wireless", "Compact 75% layout"]),
      consJson: JSON.stringify(["No numpad", "Learning curve if you type on laptops"]),
    },
    {
      slug: "novapad-ultra-tablet",
      title: "NovaPad Ultra Tablet",
      shortDescription: "11-inch OLED tablet with a stylus in the box.",
      description:
        "Good for notes, storyboards, and watching cuts on a flight. The screen is the reason to buy it.",
      priceInr: 45999,
      compareAtInr: 52999,
      categoryId: bySlug["tech-gadgets"],
      imageUrl: img("photo-1544244015-0df4b3ffc6b0"),
      sortOrder: 4,
      ...searchLinks("11 inch android tablet stylus"),
      prosJson: JSON.stringify(["OLED panel", "Stylus included", "All-day battery"]),
      consJson: JSON.stringify(["Apps can feel limited", "No headphone jack"]),
    },
    {
      slug: "brewmaster-elite-coffee",
      title: "BrewMaster Elite Coffee Maker",
      shortDescription: "Drip machine with a built-in grinder and thermal carafe.",
      description:
        "Fresh grounds every morning without a second appliance. The carafe keeps coffee hot without a hot plate.",
      priceInr: 14999,
      compareAtInr: 18999,
      categoryId: bySlug["home-kitchen"],
      imageUrl: img("photo-1495474472287-4d71bcdd2085"),
      sortOrder: 1,
      pinnedToBio: true,
      ...searchLinks("drip coffee maker with grinder"),
      prosJson: JSON.stringify(["Built-in burr grinder", "Thermal carafe", "Programmable timer"]),
      consJson: JSON.stringify(["Large footprint", "Grinder is loud"]),
    },
    {
      slug: "aircrisp-pro-air-fryer",
      title: "AirCrisp Pro XL Air Fryer",
      shortDescription: "6-quart digital air fryer with 8 presets.",
      description:
        "The kitchen ask we get every week. Fast, even, and the basket actually fits a family batch.",
      priceInr: 7999,
      compareAtInr: 10999,
      categoryId: bySlug["home-kitchen"],
      imageUrl: img("photo-1608039755401-742074f0548d"),
      sortOrder: 2,
      pinnedToBio: true,
      ...searchLinks("6 litre air fryer"),
      prosJson: JSON.stringify(["Family-size basket", "Simple presets", "Dishwasher-safe parts"]),
      consJson: JSON.stringify(["Takes counter space", "Louder than a microwave"]),
    },
    {
      slug: "pureblend-pro-blender",
      title: "PureBlend Pro Blender",
      shortDescription: "900W personal blender with a self-clean cycle.",
      description:
        "Morning smoothies without a full-size machine. Two cups in the box, BPA-free, easy to rinse.",
      priceInr: 3999,
      compareAtInr: 5499,
      categoryId: bySlug["home-kitchen"],
      imageUrl: img("photo-1570222094114-d054a817e56b"),
      sortOrder: 3,
      ...searchLinks("personal blender 900w"),
      prosJson: JSON.stringify(["Strong for the size", "Self-clean mode", "Travel cups included"]),
      consJson: JSON.stringify(["Small for families", "Loud at max"]),
    },
    {
      slug: "chefedge-knife-set",
      title: "ChefEdge Knife Set",
      shortDescription: "15-piece German steel set with a hardwood block.",
      description:
        "A balanced chef’s knife is the one you will use daily. The rest of the set is a bonus for guests.",
      priceInr: 6999,
      compareAtInr: 9999,
      categoryId: bySlug["home-kitchen"],
      imageUrl: img("photo-1593618998160-e34014e67546"),
      sortOrder: 4,
      ...searchLinks("german steel knife set with block"),
      prosJson: JSON.stringify(["Holds an edge", "Block included", "Comfortable handles"]),
      consJson: JSON.stringify(["Hand wash only", "Block needs counter space"]),
    },
    {
      slug: "zenflow-yoga-mat-pro",
      title: "ZenFlow Yoga Mat Pro",
      shortDescription: "6mm non-slip mat with alignment lines.",
      description:
        "The first thing we tell people to buy for a home gym. Grip stays decent when you sweat.",
      priceInr: 2499,
      compareAtInr: 3499,
      categoryId: bySlug["health-fitness"],
      imageUrl: img("photo-1544367567-0f2fcb009e0b"),
      sortOrder: 1,
      pinnedToBio: true,
      ...searchLinks("6mm yoga mat alignment"),
      prosJson: JSON.stringify(["Non-slip when damp", "Alignment marks", "Carry strap included"]),
      consJson: JSON.stringify(["New-mat smell for a few days", "Not the thickest option"]),
    },
    {
      slug: "powerlift-adjustable-dumbbells",
      title: "PowerLift Adjustable Dumbbells",
      shortDescription: "5–52.5 lb pair that replaces a full rack.",
      description:
        "Expensive once, cheap versus 15 pairs. Dial the weight, train, put them back on the tray.",
      priceInr: 24999,
      compareAtInr: 32999,
      categoryId: bySlug["health-fitness"],
      imageUrl: img("photo-1534438327276-14e5300c3a48"),
      sortOrder: 2,
      ...searchLinks("adjustable dumbbells 24kg"),
      prosJson: JSON.stringify(["Replaces a full rack", "Quick dial change", "Saves floor space"]),
      consJson: JSON.stringify(["Do not drop them", "Upfront cost"]),
    },
    {
      slug: "pulseband-fitness-tracker",
      title: "PulseBand Fitness Tracker",
      shortDescription: "GPS band with 7-day battery and heart-rate tracking.",
      description:
        "For runs and sleep, not a full smartwatch. Light, cheap enough to sweat on, lasts a work week.",
      priceInr: 3499,
      compareAtInr: 4999,
      categoryId: bySlug["health-fitness"],
      imageUrl: img("photo-1575311373937-040b8e1fd5b6"),
      sortOrder: 3,
      ...searchLinks("fitness band gps 7 day battery"),
      prosJson: JSON.stringify(["Built-in GPS", "Week-long battery", "50m water resistance"]),
      consJson: JSON.stringify(["Small screen", "Basic notifications"]),
    },
    {
      slug: "flexband-resistance-set",
      title: "FlexBand Resistance Set",
      shortDescription: "Five bands, door anchor, handles, and ankle straps.",
      description:
        "The travel gym. Five strengths cover warm-ups through heavy rows if you use them honestly.",
      priceInr: 1299,
      compareAtInr: 1999,
      categoryId: bySlug["health-fitness"],
      imageUrl: img("photo-1517836357463-d25dfeac3438"),
      sortOrder: 4,
      ...searchLinks("resistance band set with door anchor"),
      prosJson: JSON.stringify(["Five levels", "Full accessory kit", "Packs in a bag"]),
      consJson: JSON.stringify(["Latex can irritate skin", "Door anchor is basic"]),
    },
    {
      slug: "meridian-classic-watch",
      title: "Meridian Classic Watch",
      shortDescription: "Automatic watch with sapphire crystal and leather strap.",
      description:
        "A quiet everyday watch. No smart features — that is the point. It looks finished with a shirt or a tee.",
      priceInr: 8999,
      compareAtInr: 12999,
      categoryId: bySlug["fashion-accessories"],
      imageUrl: img("photo-1524592094714-0f0654e20314"),
      sortOrder: 1,
      ...searchLinks("automatic watch sapphire leather"),
      prosJson: JSON.stringify(["Sapphire crystal", "Automatic movement", "100m water resistance"]),
      consJson: JSON.stringify(["Needs a wear or a wind", "No smart features"]),
    },
    {
      slug: "voyager-carry-on-backpack",
      title: "Voyager Carry-On Backpack",
      shortDescription: "28–35L travel pack with a TSA laptop sleeve.",
      description:
        "The bag we take on flights. Expands when you overpack, laptop comes out at security without emptying the bag.",
      priceInr: 5999,
      compareAtInr: 7999,
      categoryId: bySlug["fashion-accessories"],
      imageUrl: img("photo-1553062407-98eeb64c6a62"),
      sortOrder: 2,
      pinnedToBio: true,
      ...searchLinks("travel backpack 35 litre tsa"),
      prosJson: JSON.stringify(["Expands to 35L", "TSA laptop access", "Water-resistant fabric"]),
      consJson: JSON.stringify(["Looks bulky when full", "No hip belt"]),
    },
    {
      slug: "luxframe-polarized-sunglasses",
      title: "LuxFrame Polarized Sunglasses",
      shortDescription: "Titanium frames, polarized lenses, UV400.",
      description:
        "Light enough to forget they are on. Polarized for driving, hard case in the box.",
      priceInr: 2999,
      compareAtInr: 4499,
      categoryId: bySlug["fashion-accessories"],
      imageUrl: img("photo-1511499767150-a48a237f0083"),
      sortOrder: 3,
      ...searchLinks("titanium polarized sunglasses uv400"),
      prosJson: JSON.stringify(["Very light", "Full UV400", "Hard case included"]),
      consJson: JSON.stringify(["Few frame styles", "Not sports wrap"]),
    },
    {
      slug: "heritage-leather-wallet",
      title: "Heritage Leather Wallet",
      shortDescription: "Slim bifold in full-grain leather with RFID.",
      description:
        "Eight cards, two bill slots, and it will not blow out a front pocket. Leather gets better, not worse.",
      priceInr: 1899,
      compareAtInr: 2499,
      categoryId: bySlug["fashion-accessories"],
      imageUrl: img("photo-1627123424574-724758594e93"),
      sortOrder: 4,
      ...searchLinks("full grain leather rfid wallet"),
      prosJson: JSON.stringify(["Full-grain leather", "RFID lining", "Slim profile"]),
      consJson: JSON.stringify(["Tight for a thick cash stack", "Needs occasional conditioning"]),
    },
    {
      slug: "vitamin-c-glow-serum",
      title: "Vitamin C Glow Serum",
      shortDescription: "10% Vitamin C, brightens in 4 weeks.",
      description: "The bottle from the morning routine reel. Brightens without a sticky finish.",
      priceInr: 649,
      compareAtInr: 1099,
      categoryId: bySlug["beauty"],
      imageUrl: img("photo-1620916566398-39f1143ab7be"),
      sortOrder: 1,
      pinnedToBio: true,
      ...searchLinks("vitamin c serum 10 percent"),
      prosJson: JSON.stringify(["10% Vitamin C", "Brightens in 4 weeks", "Lightweight texture"]),
      consJson: JSON.stringify(["Can sting on broken skin", "Needs SPF in the day"]),
      featuresJson: JSON.stringify({ Size: "30ml", Actives: "10% Vitamin C", Finish: "Serum" }),
    },
    {
      slug: "matte-lip-crayon-set",
      title: "Matte Lip Crayon Set",
      shortDescription: "Six transfer-proof nudes.",
      description: "The set from the GRWM reel. Six nudes, transfer-proof enough for a commute.",
      priceInr: 549,
      compareAtInr: 1299,
      categoryId: bySlug["beauty"],
      imageUrl: img("photo-1586495777744-4413f21062fa"),
      sortOrder: 2,
      ...searchLinks("matte lip crayon set"),
      prosJson: JSON.stringify(["Six nudes", "Transfer-proof", "Easy crayon format"]),
      consJson: JSON.stringify(["Dries lips if you skip balm", "Nude range only"]),
      featuresJson: JSON.stringify({ Shades: "6", Finish: "Matte", Wear: "Transfer-proof" }),
    },
  ];

  const storePlan: Record<string, { store: string; popular?: boolean }> = {
    "airwave-pro-headphones": { store: "amazon", popular: true },
    "pixelview-4k-monitor": { store: "flipkart" },
    "swifttype-mechanical-keyboard": { store: "amazon" },
    "novapad-ultra-tablet": { store: "flipkart" },
    "brewmaster-elite-coffee": { store: "amazon" },
    "aircrisp-pro-air-fryer": { store: "flipkart", popular: true },
    "pureblend-pro-blender": { store: "meesho" },
    "chefedge-knife-set": { store: "ajio" },
    "zenflow-yoga-mat-pro": { store: "ajio" },
    "powerlift-adjustable-dumbbells": { store: "amazon" },
    "pulseband-fitness-tracker": { store: "flipkart" },
    "flexband-resistance-set": { store: "meesho" },
    "meridian-classic-watch": { store: "amazon", popular: true },
    "voyager-carry-on-backpack": { store: "myntra" },
    "luxframe-polarized-sunglasses": { store: "myntra" },
    "heritage-leather-wallet": { store: "myntra" },
    "vitamin-c-glow-serum": { store: "nykaa", popular: true },
    "matte-lip-crayon-set": { store: "nykaa" },
  };

  function storeUrl(store: string, amazonUrl: string, flipkartUrl: string) {
    if (store === "amazon") return amazonUrl;
    if (store === "flipkart") return flipkartUrl;
    if (store === "myntra") return amazonUrl.replace("amazon.in/s?k=", "myntra.com/");
    if (store === "ajio") return amazonUrl.replace("https://www.amazon.in/s?k=", "https://www.ajio.com/search/?text=");
    if (store === "nykaa") return amazonUrl.replace("https://www.amazon.in/s?k=", "https://www.nykaa.com/search/result/?q=");
    if (store === "meesho") return amazonUrl.replace("https://www.amazon.in/s?k=", "https://www.meesho.com/search?q=");
    return amazonUrl || flipkartUrl;
  }

  for (const product of products) {
    const plan = storePlan[product.slug] ?? { store: "amazon" };
    const affiliateUrl = storeUrl(plan.store, product.amazonUrl, product.flipkartUrl);
    const editorial = EDITORIAL_BY_SLUG[product.slug];
    if (!editorial) {
      throw new Error(`Missing editorial overlay for ${product.slug}`);
    }
    const payload = {
      ...product,
      ...editorial,
      store: plan.store,
      affiliateUrl,
      amazonUrl: plan.store === "amazon" ? affiliateUrl : "",
      flipkartUrl: plan.store === "flipkart" ? affiliateUrl : "",
      networkUrl: plan.store !== "amazon" && plan.store !== "flipkart" ? affiliateUrl : "",
      popular: Boolean(plan.popular),
      published: true,
      lastPriceCheckedAt: new Date("2026-08-14T00:00:00.000Z"),
    };
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: payload,
      create: payload,
    });
  }

  for (const page of LEGAL_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  await prisma.setting.upsert({
    where: { key: "siteName" },
    update: {},
    create: { key: "siteName", value: "CuratedPicks" },
  });

  console.log(`Seeded admin ${email} and ${products.length} products`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("seed")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
