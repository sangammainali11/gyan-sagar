import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { getRecommendations } from "@/actions/get-recommendations";
import { CoursesList } from "@/components/courses-list";
import { auth } from "@/lib/auth-helper";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);
  const recommendedCourses = await getRecommendations(userId);

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label="Courses in Progress"
            numberOfItems={coursesInProgress.length}
          />
          <InfoCard
            icon={CheckCircle2}
            label="Completed Courses"
            numberOfItems={completedCourses.length}
            variant="success"
            size={26}
          />
        </div>
        <CoursesList 
          items={[...coursesInProgress, ...completedCourses]}
        />
      </div>

      {recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-x-2">
            <div className="p-2 bg-sky-100 rounded-full">
              <Sparkles className="h-5 w-5 text-sky-700" />
            </div>
            <h2 className="text-xl font-bold">Recommended for You</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on courses frequently bought together by other students.
          </p>
          <CoursesList 
            items={recommendedCourses}
          />
        </div>
      )}
    </div>
  );
}
