import { auth } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

import { getTeacherAnalytics } from "@/actions/get-teacher-analytics";
import { DataCard } from "./_components/datacard";
import { Chart } from "./_components/chart";
import { StudentAnalyticsTable } from "./_components/student-analytics-table";

const AnalyticsPage = async () => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const {
        chartData,
        totalRevenue,
        totalSales,
        students,
    } = await getTeacherAnalytics(userId);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Course Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <DataCard 
                    label="Total Revenue"
                    value={totalRevenue}
                    shouldFormat
                />
                <DataCard 
                    label="Total Enrollments"
                    value={totalSales}
                />
            </div>
            <div className="mb-8">
                <Chart data={chartData} />
            </div>
            
            <StudentAnalyticsTable students={students} />
        </div>
    );
}
 
export default AnalyticsPage;