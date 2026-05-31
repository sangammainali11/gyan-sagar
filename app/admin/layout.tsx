import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldAlert,
  DollarSign,
  Activity,
  ArrowLeft,
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Content Moderation", icon: ShieldAlert },
  { href: "/admin/revenue", label: "Platform Revenue", icon: DollarSign },
  { href: "/admin/recovery", label: "Account Recovery", icon: Activity },
];

const AdminLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth();

  if (!session?.userId) {
    return redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-col fixed inset-y-0 z-50 bg-slate-900 text-white hidden md:flex">
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-x-2">
            <div className="p-1.5 bg-rose-500 rounded-md">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin Panel</span>
          </div>
          {user.name && (
            <p className="text-xs text-slate-400 mt-2 truncate">{user.name}</p>
          )}
        </div>

        <nav className="flex flex-col p-4 gap-1 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center gap-4 overflow-x-auto sticky top-0 z-50">
        <div className="flex items-center gap-x-2 shrink-0 mr-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <span className="font-bold">Admin</span>
        </div>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {label}
          </Link>
        ))}
        <Link href="/dashboard" className="text-sm text-slate-400 whitespace-nowrap ml-auto">
          ← Site
        </Link>
      </div>

      {/* Main Content */}
      <main className="md:pl-64 flex-1 min-h-screen bg-slate-50">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

