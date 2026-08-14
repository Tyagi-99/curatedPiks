import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ||= "file:./prisma/dev.db";
process.env.AUTH_SECRET ||= "curatedpicks-change-this-auth-secret-32b";

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
