import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function databaseUrl() {
  const configured = process.env.DATABASE_URL;
  if (configured && !configured.startsWith("file:")) return configured;

  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  if (process.env.VERCEL) {
    const dest = "/tmp/curatedpicks.db";
    if (!existsSync(dest) && existsSync(bundled)) {
      copyFileSync(bundled, dest);
    }
    return `file:${dest}`;
  }

  return configured ?? `file:${bundled}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
