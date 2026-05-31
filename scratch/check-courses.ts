import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      isPublished: true,
      reviewStatus: true,
    }
  });
  console.log("=== COURSES STATE ===");
  console.dir(courses, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
