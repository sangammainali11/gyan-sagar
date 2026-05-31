import { db } from "@/lib/db";
import { DollarSign, Users, BookOpen, ShieldAlert, BarChart2, Activity } from "lucide-react";
import Link from "next/link";

const AdminDashboardPage = async () => {
  const [
    totalUsers,
    totalCourses,
    totalPurchases,
    pendingModeration,
    suspiciousRecovery,
    recentLogs,
  ] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.purchase.count(),
    db.course.count({ where: { reviewStatus: "PENDING" } }),
    db.recoveryRequest.count({ where: { status: "SUSPICIOUS" } }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const revenueAggregate = await db.purchase.aggregate({
    _sum: { platformFee: true, teacherEarnings: true },
  });

  const totalPlatformRevenue = revenueAggregate._sum.platformFee ?? 0;
  const totalTeacherPayout = revenueAggregate._sum.teacherEarnings ?? 0;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, href: null, color: "bg-blue-50 text-blue-700" },
    { label: "Total Courses", value: totalCourses, icon: BookOpen, href: "/admin/courses", color: "bg-emerald-50 text-emerald-700" },
    { label: "Purchases", value: totalPurchases, icon: BarChart2, href: "/admin/revenue", color: "bg-violet-50 text-violet-700" },
    { label: "Moderation Queue", value: pendingModeration, icon: ShieldAlert, href: "/admin/courses", color: "bg-amber-50 text-amber-700" },
    { label: "Platform Revenue (5%)", value: `$${totalPlatformRevenue.toFixed(2)}`, icon: DollarSign, href: "/admin/revenue", color: "bg-sky-50 text-sky-700" },
    { label: "Suspicious Recovery", value: suspiciousRecovery, icon: Activity, href: "/admin/recovery", color: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview and quick actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <div className="bg-white border rounded-lg p-5 flex items-center gap-x-4 shadow-sm hover:shadow-md transition">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/courses">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg p-6 hover:opacity-90 transition cursor-pointer">
            <ShieldAlert className="h-8 w-8 mb-3" />
            <h3 className="font-bold text-lg">Content Moderation</h3>
            <p className="text-sm opacity-80">Review, approve or flag teacher-uploaded courses.</p>
          </div>
        </Link>
        <Link href="/admin/revenue">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-lg p-6 hover:opacity-90 transition cursor-pointer">
            <DollarSign className="h-8 w-8 mb-3" />
            <h3 className="font-bold text-lg">Revenue Analytics</h3>
            <p className="text-sm opacity-80">Track platform commissions and teacher payouts.</p>
          </div>
        </Link>
        <Link href="/admin/recovery">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-lg p-6 hover:opacity-90 transition cursor-pointer">
            <Activity className="h-8 w-8 mb-3" />
            <h3 className="font-bold text-lg">Account Recovery Log</h3>
            <p className="text-sm opacity-80">Monitor password resets and suspicious attempts.</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Log */}
      {recentLogs.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Recent Admin Activity</h2>
          </div>
          <ul className="divide-y">
            {recentLogs.map((log) => (
              <li key={log.id} className="px-5 py-3 flex justify-between items-center text-sm">
                <span className="font-medium">{log.action}</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
