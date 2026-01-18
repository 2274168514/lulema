import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, duration, method, note } = body;

  if (!["PERSIST", "TAKEOFF"].includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // 检查今日是否已自律打卡
  const todayPersist = await prisma.dailyRecord.findFirst({
    where: {
      userId: user.id,
      status: "PERSIST",
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  let newStreak = user.currentStreak;
  let newMerit = user.merit;
  let newTotalTakeoffs = user.totalTakeoffs;

  if (type === "PERSIST") {
    // 自律：一天只能打卡一次
    if (todayPersist) {
      return NextResponse.json({ message: "今日已打卡自律" }, { status: 400 });
    }
    newStreak += 1;
    newMerit += 10;
  } else {
    // 起飞：一天可以多次
    newTotalTakeoffs += 1;
    newMerit += 1; // 安慰分
    // 只有今天没自律打卡时才重置连续天数
    if (!todayPersist) {
      newStreak = 0;
    }
  }

  // 事务更新
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        maxStreak: Math.max(newStreak, user.maxStreak),
        merit: newMerit,
        totalTakeoffs: newTotalTakeoffs,
        lastCheckIn: new Date(),
      },
    }),
    prisma.dailyRecord.create({
      data: {
        userId: user.id,
        date: new Date(),
        status: type,
        duration: type === "TAKEOFF" ? duration || null : null,
        method: type === "TAKEOFF" ? method || null : null,
        note: note || null,
      },
    }),
  ]);

  // 如果有心得，自动发布到社区
  if (note && note.trim()) {
    await prisma.post.create({
      data: {
        userId: user.id,
        content: note,
        type: type === "PERSIST" ? "SELF_DISCIPLINE" : method || "TAKEOFF",
      },
    });
  }

  return NextResponse.json({ 
    success: true, 
    newStreak, 
    newMerit,
    newTotalTakeoffs,
  });
}
