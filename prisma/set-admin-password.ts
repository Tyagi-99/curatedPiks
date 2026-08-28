/**
 * Reset an account's password from the command line.
 *
 * The seed only sets a password when it creates an account, so this is the
 * recovery path when the password is forgotten or needs rotating out of band
 * (for example because an old default was published in a public repo).
 *
 *   ADMIN_EMAIL=you@example.com NEW_PASSWORD='...' pnpm admin:password
 *
 * Pass the password via env, not argv, so it does not land in shell history.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const MIN = 12;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.NEW_PASSWORD ?? "";

  if (!email) throw new Error("Set ADMIN_EMAIL to the account you want to update.");
  if (password.length < MIN) {
    throw new Error(`Set NEW_PASSWORD to at least ${MIN} characters.`);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`No user with email ${email}.`);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        // Invalidates every session cookie issued before now.
        passwordChangedAt: new Date(),
      },
    });
    console.log(`Password updated for ${email}. All existing sessions are signed out.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
