"use client";

import { StudentAnalytics } from "@/actions/get-teacher-analytics";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress exists

interface StudentAnalyticsTableProps {
  students: StudentAnalytics[];
}

export const StudentAnalyticsTable = ({ students }: StudentAnalyticsTableProps) => {
  if (students.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        No students enrolled yet.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Student Progress</h2>
        <p className="text-sm text-muted-foreground">
          Detailed overview of all students enrolled in your courses.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Enrollment Date</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.email}</div>
                </td>
                <td className="px-6 py-4 font-medium">{student.courseTitle}</td>
                <td className="px-6 py-4">
                  {format(new Date(student.enrollmentDate), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-x-2">
                    <Progress value={student.progressPercentage} className="h-2 w-24" />
                    <span className="text-xs font-medium">{student.progressPercentage}%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {student.completedChapters} / {student.totalChapters} Chapters
                  </div>
                </td>
                <td className="px-6 py-4">
                  {student.lastActiveDate
                    ? format(new Date(student.lastActiveDate), "MMM dd, yyyy")
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
