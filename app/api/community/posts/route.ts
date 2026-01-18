export const runtime = 'edge';

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "SELF_DISCIPLINE";

  let where = {};
  if (type === "SELF_DISCIPLINE") {
    where = { type: "SELF_DISCIPLINE" };
  } else if (type === "DEER_KING") {
    where = { type: { not: "SELF_DISCIPLINE" } };
  } else {
    where = { type };
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      user: {
        select: { name: true, image: true, merit: true },
      },
      // 检查当前用户是否点赞
      likedBy: currentUserId ? {
        where: { userId: currentUserId },
        select: { userId: true }
      } : false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 格式化返回数据，添加 liked 字段
  const formattedPosts = posts.map(post => ({
    ...post,
    liked: post.likedBy && post.likedBy.length > 0,
    likedBy: undefined, // 移除原始关联数据
  }));

  return NextResponse.json(formattedPosts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content, type } = await req.json();
  
  if (!content) {
    return NextResponse.json({ message: "Content required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      content,
      type,
    },
  });

  return NextResponse.json({ ...post, liked: false });
}
