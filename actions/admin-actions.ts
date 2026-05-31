"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth-helper";
import { CourseReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getAdminCourses = async () => {
  const session = await auth();
  if (!session?.userId) return [];

  const user = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (user?.role !== "ADMIN") return [];

  const courses = await db.course.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      category: true,
      chapters: {
        select: {
          id: true,
          isPublished: true
        }
      }
    }
  });

  return courses;
};

export const updateCourseReviewStatus = async (courseId: string, status: CourseReviewStatus) => {
  try {
    const session = await auth();
    if (!session?.userId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { id: session.userId }
    });

    if (user?.role !== "ADMIN") return { error: "Unauthorized" };

    const data: { reviewStatus: CourseReviewStatus; isPublished?: boolean } = { reviewStatus: status };
    if (status === "FLAGGED" || status === "REJECTED") {
      data.isPublished = false; // unpublish if flagged or rejected
    } else if (status === "APPROVED") {
      data.isPublished = true; // publish back if approved by admin
    }

    await db.course.update({
      where: { id: courseId },
      data,
    });

    await db.activityLog.create({
      data: {
        action: `COURSE_${status}`,
        userId: session.userId,
        details: `Course ${courseId} status changed to ${status}`,
      }
    });

    revalidatePath("/admin/courses");
    revalidatePath("/dashboard/search");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: "Course status updated" };
  } catch (error) {
    console.log("[UPDATE_COURSE_STATUS]", error);
    return { error: "Internal Error" };
  }
};
