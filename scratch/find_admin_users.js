const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAdminUsers() {
  console.log("Checking admin users...");
  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
  });
  console.log("Admin Users in database:", JSON.stringify(adminUsers, null, 2));

  console.log("\nChecking for sangammainali07@gmail.com...");
  const user07 = await prisma.user.findUnique({
    where: { email: "sangammainali07@gmail.com" },
  });
  console.log("User 07:", JSON.stringify(user07, null, 2));

  console.log("\nChecking for sangammainali02@gmail.com...");
  const user02 = await prisma.user.findUnique({
    where: { email: "sangammainali02@gmail.com" },
  });
  console.log("User 02:", JSON.stringify(user02, null, 2));

  await prisma.$disconnect();
}

checkAdminUsers().catch(console.error);
