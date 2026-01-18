"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  calendarData?: Record<string, { persist: boolean; takeoff: boolean }>;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function Calendar({ currentMonth, onMonthChange, calendarData }: CalendarProps) {
  // 生成日历天数
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // 获取日期状态
  const getDayStatus = (day: Date): "none" | "persist" | "takeoff" | "both" => {
    if (!calendarData) return "none";
    
    const dateKey = new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString();
    const data = calendarData[dateKey];
    
    if (!data) return "none";
    if (data.persist && data.takeoff) return "both";
    if (data.takeoff) return "takeoff"; // 起飞优先级高
    if (data.persist) return "persist";
    return "none";
  };

  // 切换月份
  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="w-full">
      {/* 月份头部 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ChevronLeft size={20} className="text-ios-gray-1" />
        </button>
        <span className="font-semibold text-base">
          {format(currentMonth, "yyyy年MM月", { locale: zhCN })}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ChevronRight size={20} className="text-ios-gray-1" />
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-ios-gray-2 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const status = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          // 根据状态决定样式
          let bgClass = "bg-gray-100"; // 默认
          let textClass = "text-ios-gray-1";
          
          if (!isCurrentMonth) {
            bgClass = "bg-transparent";
            textClass = "text-ios-gray-3";
          } else if (status === "takeoff" || status === "both") {
            // 起飞优先级高，红色
            bgClass = "bg-danger";
            textClass = "text-white";
          } else if (status === "persist") {
            bgClass = "bg-success";
            textClass = "text-white";
          }
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                aspect-square flex items-center justify-center
                rounded-lg text-sm font-medium
                ${bgClass} ${textClass}
                ${isTodayDate ? "ring-2 ring-primary ring-offset-1" : ""}
              `}
            >
              {format(day, "d")}
            </motion.div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-success"></span>
          自律
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-danger"></span>
          起飞
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-2 ring-primary"></span>
          今天
        </span>
      </div>
    </div>
  );
}
