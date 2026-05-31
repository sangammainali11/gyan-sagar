/**
 * Admin Seeder Script
 * 
 * Usage:
 *   npx ts-node scripts/seed-admin.ts
 * 
 * Or with tsx:
 *   npx tsx scripts/seed-admin.ts
 *
 * This script promotes an existing user to ADMIN role.
 * Set ADMIN_EMAIL in .env before running.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error(
      "❌  ADMIN_EMAIL is not set in your .env file.\n" +
      "    Add: ADMIN_EMAIL=your@email.com"
    );
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email: adminEmail } });

  if (!user) {
    console.error(`❌  No user found with email: ${adminEmail}`);
    console.error("    Please register with this email first, then run this script.");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`✅  User ${adminEmail} is already an ADMIN. Nothing to do.`);
    process.exit(0);
  }

  await db.user.update({
    where: { email: adminEmail },
    data: { role: "ADMIN" },
  });

  console.log(`✅  Successfully promoted ${adminEmail} to ADMIN role.`);
  console.log("    They can now access /admin on the platform.");
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
