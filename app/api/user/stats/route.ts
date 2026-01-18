import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      dailyRecords: {
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 今日自律/起飞状态
  const todayRecords = user.dailyRecords;
  const hasPersist = todayRecords.some(r => r.status === "PERSIST");
  const todayTakeoffs = todayRecords.filter(r => r.status === "TAKEOFF").length;

  return NextResponse.json({
    currentStreak: user.currentStreak,
    maxStreak: user.maxStreak,
    merit: user.merit,
    totalTakeoffs: user.totalTakeoffs,
    todayTakeoffs,
    hasPersist,
    startDate: user.startDate,
  });
}
