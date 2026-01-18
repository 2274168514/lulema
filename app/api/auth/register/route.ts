export const runtime = 'edge';

import { NextResponse } from "next/server";
export const runtime = 'edge';

import { supabase } from "@/lib/supabase";
export const runtime = 'edge';

import { hash } from "bcryptjs";
export const runtime = 'edge';

import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "昵称至少2个字符"),
  password: z.string().min(6, "密码至少6位"),
  age: z.number().int().min(1).max(150).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, age } = registerSchema.parse(body);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('name', name)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "该昵称已被使用" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const { data: user, error } = await supabase
      .from('user')
      .insert([{
        name,
        password: hashedPassword,
        age: age || null,
        merit: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalTakeoffs: 0,
        startDate: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { user: { id: user.id, name: user.name }, message: "注册成功" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: error.errors?.[0]?.message || "输入格式错误" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
