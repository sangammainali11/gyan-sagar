import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.purchase.findMany({
    include: {
      course: true
    }
  });

  console.log(`Found ${purchases.length} purchases to examine...`);

  let updatedCount = 0;
  for (const purchase of purchases) {
    if (purchase.platformFee === null || purchase.teacherEarnings === null) {
      const price = purchase.course.price ?? 0;
      const platformFee = price * 0.05;
      const teacherEarnings = price * 0.95;

      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          platformFee,
          teacherEarnings
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully backfilled ${updatedCount} purchase records!`);

  // Now aggregate values on Course models for quick loading
  const courses = await prisma.course.findMany();
  for (const course of courses) {
    const coursePurchases = await prisma.purchase.findMany({
      where: { courseId: course.id }
    });

    let adminRevenue = 0;
    let teacherRevenue = 0;
    coursePurchases.forEach(p => {
      adminRevenue += p.platformFee ?? 0;
      teacherRevenue += p.teacherEarnings ?? 0;
    });

    await prisma.course.update({
      where: { id: course.id },
      data: {
        adminRevenue,
        teacherRevenue
      }
    });
  }
  console.log("Successfully aggregated course-specific revenues!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
