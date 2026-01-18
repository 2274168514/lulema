import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfDay } from "date-fns";

export const runtime = 'edge';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

  const date = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const records = await prisma.dailyRecord.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      date: true,
      status: true,
    },
  });

  // 按日期分组
  const calendarData: Record<string, { persist: boolean; takeoff: boolean }> = {};
  
  records.forEach((record) => {
    const dateKey = startOfDay(record.date).toISOString();
    if (!calendarData[dateKey]) {
      calendarData[dateKey] = { persist: false, takeoff: false };
    }
    if (record.status === "PERSIST") {
      calendarData[dateKey].persist = true;
    } else if (record.status === "TAKEOFF") {
      calendarData[dateKey].takeoff = true;
    }
  });

  return NextResponse.json({ calendarData });
}
