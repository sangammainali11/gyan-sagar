import { getAdminRevenue } from "@/actions/get-admin-revenue";
import { DataCard } from "@/app/dashboard/(routes)/teacher/analytics/_components/datacard";
import { Chart } from "@/app/dashboard/(routes)/teacher/analytics/_components/chart";

const AdminRevenuePage = async () => {
  const analytics = await getAdminRevenue();

  if (!analytics) {
    return <div>Unauthorized</div>;
  }

  const { totalPlatformRevenue, totalTeacherEarnings, totalTransactions, chartData } = analytics;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-y-2 mb-6">
        <h1 className="text-2xl font-bold">Platform Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your 5% platform commission and teacher earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <DataCard
          label="Total Platform Commission (5%)"
          value={totalPlatformRevenue}
          shouldFormat
        />
        <DataCard
          label="Total Teacher Earnings (95%)"
          value={totalTeacherEarnings}
          shouldFormat
        />
        <DataCard
          label="Total Transactions"
          value={totalTransactions}
        />
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Commission Growth</h2>
        <Chart data={chartData} />
      </div>
    </div>
  );
};

export default AdminRevenuePage;
