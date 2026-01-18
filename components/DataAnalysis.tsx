"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: '周一', val: 400 },
  { name: '周二', val: 300 },
  { name: '周三', val: 600 },
  { name: '周四', val: 800 },
  { name: '周五', val: 500 },
  { name: '周六', val: 900 },
  { name: '周日', val: 1000 },
];

export default function DataAnalysis({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xl font-bold">数据分析</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-gray-500 text-sm">功德增长趋势</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#ca8a04" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="text-gray-400 text-xs">平均坚持</div>
            <div className="text-xl font-bold">5.2 <span className="text-sm">天</span></div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="text-gray-400 text-xs">起飞次数</div>
            <div className="text-xl font-bold text-red-500">3 <span className="text-sm">次</span></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
