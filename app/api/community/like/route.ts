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

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ message: "Post ID required" }, { status: 400 });
  }

  const userId = session.user.id;

  // 检查是否已点赞
  const existingLike = await prisma.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  let likesCount = 0;

  if (existingLike) {
    // 取消点赞
    await prisma.$transaction([
      prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      }),
    ]);
    // 获取最新计数
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { likes: true } });
    likesCount = post?.likes || 0;
    return NextResponse.json({ liked: false, likes: likesCount });
  } else {
    // 点赞
    await prisma.$transaction([
      prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      }),
    ]);
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { likes: true } });
    likesCount = post?.likes || 0;
    return NextResponse.json({ liked: true, likes: likesCount });
  }
}
