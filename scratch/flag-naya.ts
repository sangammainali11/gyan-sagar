import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.course.updateMany({
    where: {
      title: "nayacourse",
    },
    data: {
      reviewStatus: "FLAGGED",
      isPublished: false,
    }
  });
  console.log(`Updated ${result.count} courses matching "nayacourse" to FLAGGED/unpublished.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
