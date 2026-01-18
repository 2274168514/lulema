"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, X, User, Rocket, Leaf } from "lucide-react";
import WoodenFishModal from "@/components/WoodenFishModal";
import Calendar from "@/components/Calendar";
import BottomNav from "@/components/BottomNav";
import { getAchievementLevel } from "@/lib/achievements";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// 起飞方式选项
const TAKEOFF_METHODS = [
  "日剧",
  "韩剧", 
  "欧美",
  "国产",
  "动漫",
  "直播",
  "干起",
];

export default function HomePage() {
  const { data, isLoading } = useSWR("/api/user/stats", fetcher);
  const { data: userData } = useSWR("/api/user/profile", fetcher); // 获取用户基础信息
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 获取日历数据
  const calendarUrl = `/api/user/calendar?year=${currentMonth.getFullYear()}&month=${currentMonth.getMonth() + 1}`;
  const { data: calendarData } = useSWR(calendarUrl, fetcher);
  
  const [showSOS, setShowSOS] = useState(false);
  const [showPersistModal, setShowPersistModal] = useState(false);
  const [showTakeoffModal, setShowTakeoffModal] = useState(false);
  
  // 起飞弹窗状态
  const [takeoffData, setTakeoffData] = useState({
    duration: "",
    method: "",
    note: "",
  });
  
  // 自律弹窗状态
  const [persistNote, setPersistNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 获取成就等级
  const achievementLevel = getAchievementLevel(data?.totalTakeoffs || 0);

  const handlePersist = async () => {
    setSubmitting(true);
    const res = await fetch("/api/user/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        type: "PERSIST",
        note: persistNote || undefined,
      }),
    });

    if (res.ok) {
      mutate("/api/user/stats");
      mutate(calendarUrl);
      setShowPersistModal(false);
      setPersistNote("");
    } else {
      const err = await res.json();
      alert(err.message);
    }
    setSubmitting(false);
  };

  const handleTakeoff = async () => {
    if (!takeoffData.method) {
      alert("请选择起飞方式");
      return;
    }
    
    setSubmitting(true);
    const res = await fetch("/api/user/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "TAKEOFF",
        duration: takeoffData.duration ? parseInt(takeoffData.duration) : undefined,
        method: takeoffData.method,
        note: takeoffData.note || undefined,
      }),
    });

    if (res.ok) {
      mutate("/api/user/stats");
      mutate(calendarUrl);
      setShowTakeoffModal(false);
      setTakeoffData({ duration: "", method: "", note: "" });
    } else {
      const err = await res.json();
      alert(err.message);
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ios-gray-1">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* 顶部头部：用户信息 + 等级 */}
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-lg">
            {userData?.name?.[0] || <User size={20} />}
          </div>
          <div>
            <h1 className="font-bold text-lg">{userData?.name || "道友"}</h1>
            <p className="text-xs text-ios-gray-1">
              修行 {userData?.stats?.totalDays || 0} 天
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
          style={{
            backgroundColor: achievementLevel.bgColor,
            color: achievementLevel.color,
          }}
        >
          {achievementLevel.title}
        </motion.div>
      </div>

      {/* 核心数据展示 - 移除圆环，改为大字展示 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="px-5 py-6 text-center"
      >
        <span className="text-ios-gray-1 text-sm font-medium mb-1 block">
          已连续坚持
        </span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-6xl font-light tracking-tight text-primary">
            {data?.currentStreak || 0}
          </span>
          <span className="text-xl text-ios-gray-1">天</span>
        </div>
      </motion.div>

      {/* 四宫格数据卡片 */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-3 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">坚持天数</div>
            <div className="text-xl font-bold text-success">
              {data?.currentStreak || 0}
              <span className="text-xs font-normal text-ios-gray-2 ml-1">天</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-3 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">累计起飞</div>
            <div className="text-xl font-bold text-danger">
              {data?.totalTakeoffs || 0}
              <span className="text-xs font-normal text-ios-gray-2 ml-1">次</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-3 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">今日起飞</div>
            <div className="text-xl font-bold text-warning">
              {data?.todayTakeoffs || 0}
              <span className="text-xs font-normal text-ios-gray-2 ml-1">次</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-3 text-center"
          >
            <div className="text-ios-gray-1 text-xs font-medium mb-1">功德值</div>
            <div className="text-xl font-bold text-primary">
              {data?.merit || 0}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 打卡按钮 - 始终显示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="px-5 mb-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowPersistModal(true)}
            disabled={data?.hasPersist}
            className={`btn-capsule py-4 ${
              data?.hasPersist 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "btn-capsule-success"
            }`}
          >
            {data?.hasPersist ? "今日已自律" : "坚持戒律"}
          </button>
          <button
            onClick={() => setShowTakeoffModal(true)}
            className="btn-capsule btn-capsule-danger py-4"
          >
            快乐起飞
          </button>
        </div>
      </motion.div>

      {/* 状态提示 */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-ios-gray-1 text-sm text-center px-10 mb-4"
      >
        {data?.hasPersist && data?.todayTakeoffs === 0
          ? "今日已自律打卡，继续保持！"
          : data?.hasPersist && data?.todayTakeoffs > 0
          ? "今日自律后又起飞了..."
          : data?.todayTakeoffs > 0
          ? `今日已起飞 ${data.todayTakeoffs} 次，明天重新开始`
          : "今日尚未打卡"}
      </motion.p>

      {/* 修行日历 - 使用新组件 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="px-5 mb-6"
      >
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={18} className="text-primary" />
            <span className="font-semibold text-base">修行日历</span>
          </div>
          <Calendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            calendarData={calendarData?.calendarData}
          />
        </div>
      </motion.div>

      {/* SOS 浮动球 + 飘语 - 火焰渐变设计 */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0.6, 1, 0.6], y: [0, -5, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-xs font-medium mb-2 whitespace-nowrap"
          style={{ color: "#DC2626" }}
        >
          实在忍不住了！
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSOS(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{
            background: "linear-gradient(135deg, #DC2626 0%, #F97316 100%)",
            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(249, 115, 22, 0.3)",
          }}
        >
          SOS
        </motion.button>
      </div>

      {/* 自律弹窗 - Bottom Sheet */}
      <AnimatePresence>
        {showPersistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPersistModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white -z-10" />
              
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Leaf size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">坚持戒律</h3>
                  <p className="text-sm text-gray-500">今日修行，功德+10</p>
                </div>
                <button 
                  onClick={() => setShowPersistModal(false)}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  今日心得（选填）
                </label>
                <textarea
                  value={persistNote}
                  onChange={(e) => setPersistNote(e.target.value)}
                  placeholder="分享你的自律心得..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl min-h-[120px] resize-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  填写心得将自动发布到自律专区
                </p>
              </div>
              
              <button
                onClick={handlePersist}
                disabled={submitting}
                className="w-full py-4 bg-green-600 text-white rounded-full font-bold text-lg shadow-lg shadow-green-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? "提交中..." : "确认打卡"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 起飞弹窗 - Bottom Sheet */}
      <AnimatePresence>
        {showTakeoffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTakeoffModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 to-white -z-10" />

              <div className="flex justify-center mb-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">快乐起飞</h3>
                  <p className="text-sm text-gray-500">重新开始，功德+1</p>
                </div>
                <button 
                  onClick={() => setShowTakeoffModal(false)}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* 耗时 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  耗时（分钟）
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={takeoffData.duration}
                    onChange={(e) => setTakeoffData({ ...takeoffData, duration: e.target.value })}
                    placeholder="30"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    min={1}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
                </div>
              </div>
              
              {/* 起飞方式 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  起飞方式 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAKEOFF_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setTakeoffData({ ...takeoffData, method })}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        takeoffData.method === method
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 心得 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  心得（选填）
                </label>
                <textarea
                  value={takeoffData.note}
                  onChange={(e) => setTakeoffData({ ...takeoffData, note: e.target.value })}
                  placeholder="分享你的起飞心得..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl min-h-[100px] resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  填写心得将自动发布到对应分区
                </p>
              </div>
              
              <button
                onClick={handleTakeoff}
                disabled={submitting}
                className="w-full py-4 bg-red-500 text-white rounded-full font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? "提交中..." : "确认起飞"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 木鱼弹窗 */}
      <WoodenFishModal isOpen={showSOS} onClose={() => setShowSOS(false)} />

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
