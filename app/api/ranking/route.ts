import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: streakRank } = await supabase
    .from('user')
    .select('id, name, image, currentStreak, totalTakeoffs')
    .order('currentStreak', { ascending: false })
    .limit(50);

  const { data: meritRank } = await supabase
    .from('user')
    .select('id, name, image, merit, totalTakeoffs')
    .order('merit', { ascending: false })
    .limit(50);

  const { data: takeoffRank } = await supabase
    .from('user')
    .select('id, name, image, totalTakeoffs')
    .order('totalTakeoffs', { ascending: false })
    .limit(50);

  return NextResponse.json({ 
    streakRank: streakRank || [], 
    meritRank: meritRank || [], 
    takeoffRank: takeoffRank || [] 
  });
}
