export const runtime = 'edge';

"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { getAchievementLevel } from "@/lib/achievements";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"STREAK" | "MERIT" | "TAKEOFF">("STREAK");
  const { data, isLoading } = useSWR("/api/ranking", fetcher);

  const list = activeTab === "STREAK" 
    ? data?.streakRank 
    : activeTab === "MERIT" 
    ? data?.meritRank 
    : data?.takeoffRank;

  const getMedalColor = (index: number) => {
    if (index === 0) return "from-yellow-400 to-yellow-600"; // 金
    if (index === 1) return "from-gray-300 to-gray-500"; // 银
    if (index === 2) return "from-orange-400 to-orange-600"; // 铜
    return "from-ios-gray-5 to-ios-gray-4";
  };

  const getActiveTabStyle = (key: string) => {
    if (activeTab === key) {
      if (key === "TAKEOFF") return "bg-white text-danger shadow-sm";
      if (key === "STREAK") return "bg-white text-success shadow-sm";
      return "bg-white text-warning shadow-sm";
    }
    return "text-ios-gray-1";
  };

  const getValueColor = (tab: string) => {
    if (tab === "TAKEOFF") return "text-danger";
    if (tab === "STREAK") return "text-success";
    return "text-warning";
  };

  const getUnit = (tab: string) => {
    if (tab === "TAKEOFF") return "次";
    if (tab === "STREAK") return "天";
    return "功德";
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* 页面标题 */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold">排行榜</h1>
      </div>

      {/* Tab 切换 */}
      <div className="px-5 pb-4">
        <div className="glass-card p-1 flex">
          {[
            { key: "STREAK", label: "自律榜" },
            { key: "MERIT", label: "功德榜" },
            { key: "TAKEOFF", label: "起飞榜" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 text-sm font-medium rounded-[20px] transition-all duration-200 ${getActiveTabStyle(tab.key)}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排名列表 */}
      <div className="px-5 space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-ios-gray-1">加载中...</div>
        ) : (
          list?.map((user: any, index: number) => {
            const achievement = getAchievementLevel(user.totalTakeoffs || 0);
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                {/* 排名 */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${getMedalColor(index)}`}
                >
                  {index + 1}
                </div>

                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-lg">
                  {user.name?.[0] || "匿"}
                </div>

                {/* 信息 */}
                <div className="flex-1">
                  <div className="font-semibold">{user.name || "无名居士"}</div>
                  {/* 成就称号 */}
                  <div 
                    className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-medium"
                    style={{ 
                      backgroundColor: achievement.bgColor,
                      color: achievement.color
                    }}
                  >
                    {achievement.title}
                  </div>
                </div>

                {/* 数值 */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getValueColor(activeTab)}`}>
                    {activeTab === "STREAK" 
                      ? user.currentStreak 
                      : activeTab === "MERIT" 
                      ? user.merit 
                      : user.totalTakeoffs}
                  </div>
                  <div className="text-xs text-ios-gray-1">
                    {getUnit(activeTab)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
