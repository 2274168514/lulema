import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = 'edge';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { count } = await req.json();

  if (!count || count <= 0) {
    return NextResponse.json({ message: "Invalid count" }, { status: 400 });
  }

  // Update Merit and Log
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        merit: { increment: count },
      },
    }),
    prisma.woodenFishLog.create({
      data: {
        userId: session.user.id,
        count: count,
      },
    }),
  ]);

  return NextResponse.json({ success: true, added: count });
}
