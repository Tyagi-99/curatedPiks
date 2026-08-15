import { spawnSync } from "node:child_process";

const onVercel = Boolean(process.env.VERCEL);
const databaseUrl = process.env.DATABASE_URL ?? "";
const authSecret = process.env.AUTH_SECRET ?? "";

if (onVercel) {
  if (!databaseUrl.startsWith("postgres")) {
    console.error("DATABASE_URL must be a Neon postgres URL on Vercel.");
    process.exit(1);
  }
  if (!authSecret || authSecret.includes("change-this")) {
    console.error("AUTH_SECRET must be set in Vercel project settings.");
    process.exit(1);
  }
} else {
  process.env.DATABASE_URL ||= "postgresql://curated:curated@127.0.0.1:5433/curatedpicks";
  process.env.AUTH_SECRET ||= "curatedpicks-local-dev-only-auth-secret-32b";
}

function run(command) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("prisma generate");
run("prisma migrate deploy");
run("tsx prisma/seed.ts");
run("next build");
