import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('user')
    .select('name, age, image, startDate, merit, currentStreak, maxStreak, totalTakeoffs')
    .eq('id', session.user.id)
    .single();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const today = new Date();
  const weekAgo = subDays(today, 6);
  
  const { data: recentRecords } = await supabase
    .from('dailyRecord')
    .select('date, status')
    .eq('userId', session.user.id)
    .gte('date', startOfDay(weekAgo).toISOString())
    .lte('date', endOfDay(today).toISOString())
    .order('date', { ascending: true });

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const chartData = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, 6 - i);
    const dayRecords = (recentRecords || []).filter(r => {
      const recordDate = startOfDay(new Date(r.date));
      return recordDate.getTime() === startOfDay(date).getTime();
    });
    
    chartData.push({
      name: weekDays[date.getDay()],
      date: format(date, "MM/dd"),
      persist: dayRecords.filter(r => r.status === "PERSIST").length,
      takeoff: dayRecords.filter(r => r.status === "TAKEOFF").length,
    });
  }

  const { data: allRecords } = await supabase
    .from('dailyRecord')
    .select('date, status')
    .eq('userId', session.user.id);

  const totalDays = Math.ceil((today.getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const persistDays = new Set(
    (allRecords || []).filter(r => r.status === "PERSIST").map(r => startOfDay(new Date(r.date)).toISOString())
  ).size;
  const successRate = totalDays > 0 ? Math.round((persistDays / totalDays) * 100) : 0;

  let avgStreak = user.maxStreak > 0 ? Math.round((user.currentStreak + user.maxStreak) / 2) : user.currentStreak;

  return NextResponse.json({
    ...user,
    chartData,
    stats: {
      totalDays,
      persistDays,
      successRate,
      avgStreak,
      hasEnoughData: (allRecords || []).length >= 7,
    },
  });
}
