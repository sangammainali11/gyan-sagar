"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth-helper";

export const getAdminRevenue = async () => {
  const session = await auth();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (user?.role !== "ADMIN") return null;

  // Get total platform fee and teacher earnings across all purchases
  const purchases = await db.purchase.findMany({
    include: {
      course: true
    }
  });

  // Calculate totals
  let totalPlatformRevenue = 0;
  let totalTeacherEarnings = 0;
  
  // Group by month
  const monthlyRevenue: { [month: string]: number } = {};

  purchases.forEach((p) => {
    const fee = p.platformFee ?? 0;
    const earnings = p.teacherEarnings ?? 0;
    
    totalPlatformRevenue += fee;
    totalTeacherEarnings += earnings;

    const date = new Date(p.createdAt);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

    if (monthlyRevenue[monthYear]) {
      monthlyRevenue[monthYear] += fee;
    } else {
      monthlyRevenue[monthYear] = fee;
    }
  });

  const chartData = Object.entries(monthlyRevenue).map(([name, total]) => ({
    name,
    total
  }));

  return {
    totalPlatformRevenue,
    totalTeacherEarnings,
    totalTransactions: purchases.length,
    chartData
  };
};
