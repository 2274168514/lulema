import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const { data: user, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { data: todayRecords } = await supabase
    .from('dailyRecord')
    .select('*')
    .eq('userId', session.user.id)
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString());

  const records = todayRecords || [];
  const hasPersist = records.some(r => r.status === "PERSIST");
  const todayTakeoffs = records.filter(r => r.status === "TAKEOFF").length;

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
