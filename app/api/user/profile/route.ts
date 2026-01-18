import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const runtime = 'edge';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      age: true,
      image: true,
      startDate: true,
      merit: true,
      currentStreak: true,
      maxStreak: true,
      totalTakeoffs: true,
    }
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 获取最近7天的数据用于图表
  const today = new Date();
  const weekAgo = subDays(today, 6);
  
  const recentRecords = await prisma.dailyRecord.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfDay(weekAgo),
        lte: endOfDay(today),
      },
    },
    select: {
      date: true,
      status: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // 计算每日统计
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const chartData: { name: string; persist: number; takeoff: number; date: string }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, 6 - i);
    const dayRecords = recentRecords.filter(r => {
      const recordDate = startOfDay(r.date);
      return recordDate.getTime() === startOfDay(date).getTime();
    });
    
    chartData.push({
      name: weekDays[date.getDay()],
      date: format(date, "MM/dd"),
      persist: dayRecords.filter(r => r.status === "PERSIST").length,
      takeoff: dayRecords.filter(r => r.status === "TAKEOFF").length,
    });
  }

  // 计算统计数据
  const allRecords = await prisma.dailyRecord.findMany({
    where: { userId: session.user.id },
  });

  const totalDays = Math.ceil((today.getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const persistDays = new Set(
    allRecords.filter(r => r.status === "PERSIST").map(r => startOfDay(r.date).toISOString())
  ).size;
  const successRate = totalDays > 0 ? Math.round((persistDays / totalDays) * 100) : 0;

  // 计算平均坚持天数（按连续周期计算）
  let avgStreak = 0;
  if (allRecords.length > 0) {
    // 简化：使用当前连续天数和最高连续天数的平均值
    avgStreak = user.maxStreak > 0 ? Math.round((user.currentStreak + user.maxStreak) / 2) : user.currentStreak;
  }

  return NextResponse.json({
    ...user,
    chartData,
    stats: {
      totalDays,
      persistDays,
      successRate,
      avgStreak,
      hasEnoughData: allRecords.length >= 7,
    },
  });
}
