import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { INIT_SQL } from "./initSql";
import { seedDatabase } from "../../prisma/seed";

function databaseUrl() {
  const configured = process.env.DATABASE_URL;
  if (configured && !configured.startsWith("file:")) return configured;

  const bundled = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "prisma", "prisma", "dev.db"),
  ].find((file) => existsSync(file));
  if (process.env.VERCEL) {
    const dest = "/tmp/curatedpicks.db";
    if (bundled) {
      copyFileSync(bundled, dest);
    }
    return `file:${dest}`;
  }

  return configured ?? `file:${bundled ?? path.join(process.cwd(), "prisma", "dev.db")}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReady?: Promise<void>;
};

function createClient() {
  return new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const base = globalForPrisma.prisma ?? createClient();

async function applySchema(client: PrismaClient) {
  const statements = INIT_SQL.split(";").map((part) => part.trim()).filter(Boolean);
  for (const statement of statements) {
    await client.$executeRawUnsafe(statement);
  }
}

async function ensureColumns(client: PrismaClient) {
  const columns = (await client.$queryRawUnsafe(`PRAGMA table_info('Product')`)) as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  const needed = [
    ["store", `ALTER TABLE "Product" ADD COLUMN "store" TEXT NOT NULL DEFAULT ''`],
    ["affiliateUrl", `ALTER TABLE "Product" ADD COLUMN "affiliateUrl" TEXT NOT NULL DEFAULT ''`],
    ["popular", `ALTER TABLE "Product" ADD COLUMN "popular" BOOLEAN NOT NULL DEFAULT false`],
    ["brand", `ALTER TABLE "Product" ADD COLUMN "brand" TEXT NOT NULL DEFAULT ''`],
    ["quickVerdict", `ALTER TABLE "Product" ADD COLUMN "quickVerdict" TEXT NOT NULL DEFAULT ''`],
    ["whyFeatured", `ALTER TABLE "Product" ADD COLUMN "whyFeatured" TEXT NOT NULL DEFAULT ''`],
    ["highlightsJson", `ALTER TABLE "Product" ADD COLUMN "highlightsJson" TEXT NOT NULL DEFAULT '[]'`],
    ["bestForJson", `ALTER TABLE "Product" ADD COLUMN "bestForJson" TEXT NOT NULL DEFAULT '[]'`],
    ["notForJson", `ALTER TABLE "Product" ADD COLUMN "notForJson" TEXT NOT NULL DEFAULT '[]'`],
    ["finalVerdict", `ALTER TABLE "Product" ADD COLUMN "finalVerdict" TEXT NOT NULL DEFAULT ''`],
    ["editorialNotes", `ALTER TABLE "Product" ADD COLUMN "editorialNotes" TEXT NOT NULL DEFAULT ''`],
  ] as const;
  for (const [name, statement] of needed) {
    if (!names.has(name)) await client.$executeRawUnsafe(statement);
  }

  try {
    const postColumns = (await client.$queryRawUnsafe(`PRAGMA table_info('Post')`)) as { name: string }[];
    const postNames = new Set(postColumns.map((column) => column.name));
    if (postNames.size === 0) return;
    const postNeeded = [
      ["coverImageUrl", `ALTER TABLE "Post" ADD COLUMN "coverImageUrl" TEXT NOT NULL DEFAULT ''`],
      ["metaTitle", `ALTER TABLE "Post" ADD COLUMN "metaTitle" TEXT NOT NULL DEFAULT ''`],
      ["metaDescription", `ALTER TABLE "Post" ADD COLUMN "metaDescription" TEXT NOT NULL DEFAULT ''`],
      ["publishedAt", `ALTER TABLE "Post" ADD COLUMN "publishedAt" DATETIME`],
    ] as const;
    for (const [name, statement] of postNeeded) {
      if (!postNames.has(name)) await client.$executeRawUnsafe(statement);
    }
  } catch {
    /* Post table not ready yet */
  }
}

async function ensureDatabase(client: PrismaClient) {
  try {
    await client.setting.findFirst();
    await ensureColumns(client);
    return;
  } catch {
    await applySchema(client);
    await ensureColumns(client);
    await seedDatabase(client);
  }
}

if (!globalForPrisma.prismaReady) {
  globalForPrisma.prismaReady = ensureDatabase(base);
}

export const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        await globalForPrisma.prismaReady;
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = base;
}
