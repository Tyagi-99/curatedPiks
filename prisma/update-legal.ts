import { PrismaClient } from "@prisma/client";
import { LEGAL_PAGES } from "../src/lib/legalPages";

const prisma = new PrismaClient();

async function main() {
  for (const page of LEGAL_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { title: page.title, body: page.body },
      create: { slug: page.slug, title: page.title, body: page.body },
    });
    console.log("updated", page.slug);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
