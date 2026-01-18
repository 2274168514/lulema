export const runtime = 'edge';

"use client";

import { useState } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, LogOut, ChevronRight, X, AlertCircle, Award } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import BottomNav from "@/components/BottomNav";
import { getAchievementLevel, getNextLevel, getProgressToNextLevel, ACHIEVEMENT_LEVELS } from "@/lib/achievements";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { data: user, isLoading } = useSWR("/api/user/profile", fetcher);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 获取成就信息
  const achievementLevel = getAchievementLevel(user?.totalTakeoffs || 0);
  const nextLevel = getNextLevel(user?.totalTakeoffs || 0);
  const progress = getProgressToNextLevel(user?.totalTakeoffs || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ios-gray-1">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* 页面标题 */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold">我的修心</h1>
      </div>

      {/* 用户信息卡片 */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-2xl">
              {user?.name?.[0] || "道"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || "道友"}</h2>
              <p className="text-sm text-ios-gray-1">
                入道时间：{user?.startDate ? format(new Date(user.startDate), "yyyy年MM月dd日") : "未知"}
              </p>
            </div>
          </div>
          
          {/* 成就等级徽章 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: achievementLevel.color }} />
                <span 
                  className="font-bold"
                  style={{ color: achievementLevel.color }}
                >
                  {achievementLevel.title}
                </span>
              </div>
              {nextLevel && (
                <span className="text-xs text-ios-gray-2">
                  距离 {nextLevel.title} 还需 {nextLevel.minTakeoffs - (user?.totalTakeoffs || 0)} 次起飞
                </span>
              )}
            </div>
            
            {/* 进度条 */}
            {nextLevel && (
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: achievementLevel.color }}
                />
              </div>
            )}
            {!nextLevel && (
              <p className="text-xs text-ios-gray-2">已达到最高等级！</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 数据统计 */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">当前坚持</div>
            <div className="text-2xl font-bold text-success">
              {user?.currentStreak || 0}
              <span className="text-sm font-normal text-ios-gray-2 ml-1">天</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-4 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">历史最高</div>
            <div className="text-2xl font-bold text-primary">
              {user?.maxStreak || 0}
              <span className="text-sm font-normal text-ios-gray-2 ml-1">天</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">累计功德</div>
            <div className="text-2xl font-bold text-warning">
              {user?.merit || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-4 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">累计起飞</div>
            <div className="text-2xl font-bold text-danger">
              {user?.totalTakeoffs || 0}
              <span className="text-sm font-normal text-ios-gray-2 ml-1">次</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 成就等级列表 */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-primary" />
            <span className="font-semibold">成就等级</span>
          </div>
          <div className="space-y-2">
            {ACHIEVEMENT_LEVELS.map((level) => {
              const isUnlocked = (user?.totalTakeoffs || 0) >= level.minTakeoffs;
              const isCurrent = level.level === achievementLevel.level;
              
              return (
                <div
                  key={level.level}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isCurrent ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? level.bgColor : "#F9FAFB",
                    "--tw-ring-color": isCurrent ? level.color : "transparent",
                  } as React.CSSProperties}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium"
                      style={{ color: isUnlocked ? level.color : "#9CA3AF" }}
                    >
                      {level.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full">当前</span>
                    )}
                  </div>
                  <span className="text-xs text-ios-gray-2">
                    {level.minTakeoffs}+ 次起飞
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 功能列表 */}
      <div className="px-5 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => setShowAnalysis(true)}
          className="glass-card p-4 w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 size={20} className="text-primary" />
            </div>
            <span className="font-medium">数据分析</span>
          </div>
          <ChevronRight size={20} className="text-ios-gray-2" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="glass-card p-4 w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <LogOut size={20} className="text-danger" />
            </div>
            <span className="font-medium text-danger">退出登录</span>
          </div>
          <ChevronRight size={20} className="text-ios-gray-2" />
        </motion.button>
      </div>

      {/* 数据分析弹窗 */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="safe-top px-5 pt-4 pb-6 flex items-center justify-between border-b border-ios-gray-5">
              <h2 className="text-xl font-bold">数据分析</h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-2 rounded-full bg-ios-gray-6"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
              {/* 数据不足提示 */}
              {!user?.stats?.hasEnoughData && (
                <div className="mb-6 p-4 bg-warning/10 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">数据不足</p>
                    <p className="text-xs text-ios-gray-1 mt-1">
                      需要至少7天的记录才能生成准确的分析报告。继续坚持打卡，数据会越来越丰富！
                    </p>
                  </div>
                </div>
              )}

              {/* 近7天趋势图 */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-ios-gray-1 mb-4">近7天记录</h3>
                <div className="h-64 w-full glass-card p-4">
                  {user?.chartData && user.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={user.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: "#8E8E93" }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: "#8E8E93" }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: 12, 
                            border: "none", 
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)" 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="persist" name="自律" fill="#34C759" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="takeoff" name="起飞" fill="#FF3B30" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-ios-gray-2">
                      暂无数据
                    </div>
                  )}
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="text-ios-gray-1 text-xs mb-1">入道天数</div>
                  <div className="text-xl font-bold">
                    {user?.stats?.totalDays || 0} 
                    <span className="text-sm font-normal text-ios-gray-2 ml-1">天</span>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-ios-gray-1 text-xs mb-1">自律天数</div>
                  <div className="text-xl font-bold text-success">
                    {user?.stats?.persistDays || 0} 
                    <span className="text-sm font-normal text-ios-gray-2 ml-1">天</span>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-ios-gray-1 text-xs mb-1">成功率</div>
                  <div className="text-xl font-bold text-primary">
                    {user?.stats?.successRate || 0}
                    <span className="text-sm font-normal text-ios-gray-2 ml-1">%</span>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-ios-gray-1 text-xs mb-1">平均坚持</div>
                  <div className="text-xl font-bold text-warning">
                    {user?.stats?.avgStreak || 0}
                    <span className="text-sm font-normal text-ios-gray-2 ml-1">天</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
