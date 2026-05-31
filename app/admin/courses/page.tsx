import { getAdminCourses } from "@/actions/admin-actions";
import { ModerationTable } from "./_components/moderation-table";

const AdminCoursesPage = async () => {
  const courses = await getAdminCourses();

  return (
    <div className="p-6">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">Content Moderation Queue</h1>
        <p className="text-sm text-muted-foreground">
          Review, approve, or flag courses uploaded by teachers. Flagged courses are automatically unpublished.
        </p>
      </div>

      <ModerationTable initialCourses={courses} />
    </div>
  );
};

export default AdminCoursesPage;
