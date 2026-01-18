import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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

  const { data: user, error: userError } = await supabase
    .from('user')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const { data: todayPersist } = await supabase
    .from('dailyRecord')
    .select('*')
    .eq('userId', user.id)
    .eq('status', "PERSIST")
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString())
    .maybeSingle();

  let newStreak = user.currentStreak;
  let newMerit = user.merit;
  let newTotalTakeoffs = user.totalTakeoffs;

  if (type === "PERSIST") {
    if (todayPersist) {
      return NextResponse.json({ message: "今日已打卡自律" }, { status: 400 });
    }
    newStreak += 1;
    newMerit += 10;
  } else {
    newTotalTakeoffs += 1;
    newMerit += 1;
    if (!todayPersist) {
      newStreak = 0;
    }
  }

  // Update user
  await supabase
    .from('user')
    .update({
      currentStreak: newStreak,
      maxStreak: Math.max(newStreak, user.maxStreak),
      merit: newMerit,
      totalTakeoffs: newTotalTakeoffs,
      lastCheckIn: new Date().toISOString()
    })
    .eq('id', user.id);

  // Create daily record
  await supabase
    .from('dailyRecord')
    .insert([{
      userId: user.id,
      date: new Date().toISOString(),
      status: type,
      duration: type === "TAKEOFF" ? duration || null : null,
      method: type === "TAKEOFF" ? method || null : null,
      note: note || null
    }]);

  // Create post if note exists
  if (note && note.trim()) {
    await supabase
      .from('post')
      .insert([{
        userId: user.id,
        content: note,
        type: type === "PERSIST" ? "SELF_DISCIPLINE" : method || "TAKEOFF",
        likes: 0
      }]);
  }

  return NextResponse.json({ 
    success: true, 
    newStreak, 
    newMerit,
    newTotalTakeoffs,
  });
}
