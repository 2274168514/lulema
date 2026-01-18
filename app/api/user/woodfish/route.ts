export const runtime = 'edge';

import { NextResponse } from "next/server";
export const runtime = 'edge';

import { getServerSession } from "next-auth";
export const runtime = 'edge';

import { authOptions } from "@/lib/auth";
export const runtime = 'edge';

import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { count } = await req.json();

  if (!count || count <= 0) {
    return NextResponse.json({ message: "Invalid count" }, { status: 400 });
  }

  // Get current user
  const { data: user } = await supabase
    .from('user')
    .select('merit')
    .eq('id', session.user.id)
    .single();

  if (user) {
    // Update merit
    await supabase
      .from('user')
      .update({ merit: user.merit + count })
      .eq('id', session.user.id);
  }

  // Create log
  await supabase
    .from('woodenFishLog')
    .insert([{
      userId: session.user.id,
      count: count,
      createdAt: new Date().toISOString()
    }]);

  return NextResponse.json({ success: true, added: count });
}
