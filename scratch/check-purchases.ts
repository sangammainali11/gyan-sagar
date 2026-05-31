import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.purchase.findMany({
    select: {
      id: true,
      courseId: true,
      platformFee: true,
      teacherEarnings: true,
      course: {
        select: {
          title: true,
          price: true,
        }
      }
    }
  });
  console.log("=== PURCHASES ===");
  console.dir(purchases, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
