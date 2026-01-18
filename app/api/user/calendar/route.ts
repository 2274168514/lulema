export const runtime = 'edge';

import { NextResponse } from "next/server";
export const runtime = 'edge';

import { getServerSession } from "next-auth";
export const runtime = 'edge';

import { authOptions } from "@/lib/auth";
export const runtime = 'edge';

import { supabase } from "@/lib/supabase";
export const runtime = 'edge';

import { startOfMonth, endOfMonth, startOfDay } from "date-fns";

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

  const { data: records } = await supabase
    .from('dailyRecord')
    .select('date, status')
    .eq('userId', session.user.id)
    .gte('date', monthStart.toISOString())
    .lte('date', monthEnd.toISOString());

  const calendarData = {};
  
  (records || []).forEach((record) => {
    const dateKey = startOfDay(new Date(record.date)).toISOString();
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
