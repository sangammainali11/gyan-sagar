import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

export type StudentAnalytics = {
  id: string;
  name: string;
  email: string;
  courseTitle: string;
  enrollmentDate: Date;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
  lastActiveDate: Date | null;
  earnings: number;
};

export const getTeacherAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId,
        },
      },
      include: {
        course: {
          include: {
            chapters: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const userIds = Array.from(new Set(purchases.map((p) => p.userId)));

    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const progressRecords = await db.userProgress.findMany({
      where: {
        userId: { in: userIds },
        chapter: {
          course: {
            userId: userId,
          },
        },
      },
      select: {
        userId: true,
        isCompleted: true,
        updatedAt: true,
        chapter: {
          select: {
            courseId: true,
          },
        },
      },
    });

    const studentData: StudentAnalytics[] = purchases.map((purchase) => {
      const user = userMap.get(purchase.userId);
      const totalChapters = purchase.course.chapters.length;

      const userProgressForCourse = progressRecords.filter(
        (pr) =>
          pr.userId === purchase.userId && pr.chapter.courseId === purchase.courseId
      );

      const completedChapters = userProgressForCourse.filter(
        (pr) => pr.isCompleted
      ).length;

      const progressPercentage =
        totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100);

      // Find the most recent updatedAt date among the user's progress records for this course
      const lastActiveDate =
        userProgressForCourse.length > 0
          ? new Date(
              Math.max(
                ...userProgressForCourse.map((pr) => new Date(pr.updatedAt).getTime())
              )
            )
          : null;

      // Platform fee is 5%, teacher earnings is 95%. But we calculate from course price if teacherEarnings is null
      // For existing records, we just fallback to course.price
      const coursePrice = purchase.course.price ?? 0;
      const earnings = purchase.teacherEarnings ?? coursePrice * 0.95;

      return {
        id: purchase.userId + "-" + purchase.courseId,
        name: user?.name || "Unknown User",
        email: user?.email || "No Email",
        courseTitle: purchase.course.title,
        enrollmentDate: purchase.createdAt,
        progressPercentage,
        completedChapters,
        totalChapters,
        lastActiveDate,
        earnings,
      };
    });

    // Group earnings by course title for the chart
    const groupedEarnings: { [courseTitle: string]: number } = {};
    studentData.forEach((student) => {
      if (groupedEarnings[student.courseTitle]) {
        groupedEarnings[student.courseTitle] += student.earnings;
      } else {
        groupedEarnings[student.courseTitle] = student.earnings;
      }
    });

    const chartData = Object.entries(groupedEarnings).map(([name, total]) => ({
      name,
      total,
    }));

    const totalRevenue = studentData.reduce((acc, curr) => acc + curr.earnings, 0);
    const totalSales = purchases.length;

    return {
      chartData,
      totalRevenue,
      totalSales,
      students: studentData,
    };
  } catch (error) {
    console.error("[GET_TEACHER_ANALYTICS]", error);
    return {
      chartData: [],
      totalRevenue: 0,
      totalSales: 0,
      students: [],
    };
  }
};
