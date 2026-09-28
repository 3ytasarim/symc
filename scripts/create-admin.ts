/**
 * Create or reset an admin user from the command line (never via the web).
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run admin:create
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Set a valid ADMIN_EMAIL");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name: process.env.ADMIN_NAME || "Administrator", passwordHash, role: "ADMIN" },
    update: { passwordHash, isActive: true, failedLoginCount: 0, lockedUntil: null },
  });
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });
  console.log(`Admin ready: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
