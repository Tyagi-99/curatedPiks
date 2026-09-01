/**
 * Manage the seeded demo catalogue.
 *
 * The seed ships 18 example products with invented brand names, arbitrary
 * prices, and stock photography. Every one is tagged in `editorialNotes` with
 * the SAMPLE marker, which is how they are identified here — products you write
 * yourself are never touched.
 *
 * Publishing invented reviews is a real problem: it misrepresents the site to
 * visitors and it fails Amazon Associates and AdSense review. Hide them before
 * the site goes public, then add real products through the admin.
 *
 *   pnpm demo:status      show what is published vs hidden
 *   pnpm demo:unpublish   hide every demo product (safe, reversible)
 *   pnpm demo:publish     put them back (useful locally)
 */
import { PrismaClient } from "@prisma/client";

const DEMO_MARKER = "SAMPLE";

async function main() {
  const command = process.argv[2];
  const prisma = new PrismaClient();

  try {
    const where = { editorialNotes: { startsWith: DEMO_MARKER } };

    if (command === "status") {
      const demo = await prisma.product.findMany({
        where,
        select: { slug: true, published: true },
        orderBy: { slug: "asc" },
      });
      const real = await prisma.product.count({
        where: { NOT: { editorialNotes: { startsWith: DEMO_MARKER } } },
      });
      const live = demo.filter((p) => p.published).length;

      console.log(`Demo products:  ${demo.length} (${live} published, ${demo.length - live} hidden)`);
      console.log(`Your products:  ${real}`);
      if (live > 0) {
        console.log(
          `\n${live} invented product page(s) are publicly visible. Run "pnpm demo:unpublish" before launch.`,
        );
        for (const p of demo.filter((x) => x.published)) console.log(`  - /p/${p.slug}`);
      } else if (real === 0) {
        console.log("\nNothing is published. Add a product in /admin/products/new.");
      } else {
        console.log("\nNo demo content is public.");
      }
      return;
    }

    if (command === "unpublish" || command === "publish") {
      const published = command === "publish";
      const { count } = await prisma.product.updateMany({ where, data: { published } });
      console.log(`${published ? "Published" : "Hid"} ${count} demo product(s).`);
      console.log("Redeploy or wait for revalidation for the change to appear publicly.");
      return;
    }

    console.error("Usage: tsx prisma/demo-content.ts <status|unpublish|publish>");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
