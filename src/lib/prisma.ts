import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { INIT_SQL } from "./initSql";
import { seedDatabase } from "../../prisma/seed";

function databaseUrl() {
  const configured = process.env.DATABASE_URL;
  if (configured && !configured.startsWith("file:")) return configured;

  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  if (process.env.VERCEL) {
    const dest = "/tmp/curatedpicks.db";
    if (existsSync(bundled)) {
      copyFileSync(bundled, dest);
    }
    return `file:${dest}`;
  }

  return configured ?? `file:${bundled}`;
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

async function ensureDatabase(client: PrismaClient) {
  try {
    await client.setting.findFirst();
    return;
  } catch {
    await applySchema(client);
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
