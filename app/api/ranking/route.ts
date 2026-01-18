import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const streakRank = await prisma.user.findMany({
    orderBy: { currentStreak: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      currentStreak: true,
      totalTakeoffs: true, // Needed for achievement badge
    },
  });

  const meritRank = await prisma.user.findMany({
    orderBy: { merit: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      merit: true,
      totalTakeoffs: true, // Needed for achievement badge
    },
  });

  const takeoffRank = await prisma.user.findMany({
    orderBy: { totalTakeoffs: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      totalTakeoffs: true,
    },
  });

  return NextResponse.json({ streakRank, meritRank, takeoffRank });
}
