"use client";

import { useState } from "react";
import { CourseReviewStatus } from "@prisma/client";
import { updateCourseReviewStatus } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  isPublished: boolean;
  reviewStatus: string;
  category: { name: string } | null;
  chapters: unknown[];
}

export const ModerationTable = ({ initialCourses }: { initialCourses: Course[] }) => {
  const [courses, setCourses] = useState(initialCourses);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onStatusChange = async (courseId: string, newStatus: CourseReviewStatus) => {
    setLoadingId(courseId);
    try {
      const res = await updateCourseReviewStatus(courseId, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Status updated");
        setCourses((current) => 
          current.map(c => {
            if (c.id === courseId) {
              return { 
                ...c, 
                reviewStatus: newStatus,
                isPublished: (newStatus === "FLAGGED" || newStatus === "REJECTED") ? false : c.isPublished
              };
            }
            return c;
          })
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden mt-6">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-4">Course Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Published</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} className="border-b hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{course.title}</td>
              <td className="px-6 py-4">{course.category?.name || "None"}</td>
              <td className="px-6 py-4">{course.isPublished ? "Yes" : "No"}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${course.reviewStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" : ""}
                  ${course.reviewStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                  ${course.reviewStatus === "FLAGGED" ? "bg-rose-100 text-rose-700" : ""}
                  ${course.reviewStatus === "REJECTED" ? "bg-red-100 text-red-700" : ""}
                `}>
                  {course.reviewStatus}
                </span>
              </td>
              <td className="px-6 py-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                  disabled={loadingId === course.id || course.reviewStatus === "APPROVED"}
                  onClick={() => onStatusChange(course.id, "APPROVED")}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                  disabled={loadingId === course.id || course.reviewStatus === "FLAGGED"}
                  onClick={() => onStatusChange(course.id, "FLAGGED")}
                >
                  Flag
                </Button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-8 text-muted-foreground">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
