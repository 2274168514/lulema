import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt-ts";
import { z } from "zod";

export const runtime = 'nodejs';

const registerSchema = z.object({
  name: z.string().min(2, "昵称至少2个字符"),
  password: z.string().min(6, "密码至少6位"),
  age: z.number().int().min(1).max(150).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, age } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该昵称已被使用" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        age: age || null,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: "注册成功" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "输入格式错误" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
