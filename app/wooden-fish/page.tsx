"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import WoodenFish from "@/components/WoodenFish";

export default function WoodenFishPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* 顶部导航 */}
      <div className="safe-top px-4 pt-4 pb-2 flex items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary"
        >
          <ChevronLeft size={20} />
          <span>返回</span>
        </button>
        <h1 className="flex-1 text-center font-semibold pr-16">木鱼</h1>
      </div>
      
      {/* 木鱼组件 */}
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <WoodenFish />
      </div>
    </div>
  );
}
