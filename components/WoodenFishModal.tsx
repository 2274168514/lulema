"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { mutate } from "swr";

interface WoodenFishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 使用 Web Audio API 生成木鱼敲击音效
function createWoodenFishSound(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // 木鱼音效：低频 + 快速衰减
  oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);
  
  oscillator.type = "sine";
  
  gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

export default function WoodenFishModal({ isOpen, onClose }: WoodenFishModalProps) {
  const [count, setCount] = useState(0);
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 初始化 AudioContext
  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }, [isOpen]);

  // 自动保存
  useEffect(() => {
    const interval = setInterval(() => {
      if (unsavedCount > 0) {
        saveProgress();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [unsavedCount]);

  const saveProgress = async () => {
    if (unsavedCount === 0) return;
    const toSave = unsavedCount;
    setUnsavedCount(0);

    try {
      await fetch("/api/user/woodfish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: toSave }),
      });
      mutate("/api/user/stats");
    } catch (e) {
      console.error("保存失败");
      setUnsavedCount((prev) => prev + toSave);
    }
  };

  const playSound = useCallback(() => {
    if (audioContextRef.current) {
      // Resume if suspended (browser autoplay policy)
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      createWoodenFishSound(audioContextRef.current);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCount((c) => c + 1);
    setUnsavedCount((c) => c + 1);

    // 播放音效
    playSound();

    // 添加浮动文字
    const id = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFloatingTexts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);

    // 震动反馈
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleClose = () => {
    saveProgress();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #FFE5E5 0%, #FFF5F5 50%, #FFFFFF 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-12 right-6 p-2 text-rose-400 hover:text-rose-600 transition-colors"
          >
            <X size={28} />
          </button>

          {/* 功德计数 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-rose-400 text-sm mb-2">累计功德</div>
            <div className="text-rose-600 text-5xl font-light">{count}</div>
          </motion.div>

          {/* 木鱼按钮 */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className="relative w-56 h-40 flex items-center justify-center"
          >
            {/* 木鱼主体 */}
            <div
              className="w-full h-full rounded-[50%] relative"
              style={{
                background: "linear-gradient(145deg, #A0522D 0%, #8B4513 50%, #5D2E0C 100%)",
                boxShadow: "0 20px 60px rgba(139, 69, 19, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* 木鱼纹路 */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 rounded-[50%] border-2 border-amber-800/40"
              />
              {/* 中心圆点 */}
              <div
                className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900/50"
              />
              {/* 高光 */}
              <div
                className="absolute top-4 left-1/3 w-16 h-6 rounded-full bg-white/20 blur-sm"
              />
            </div>

            {/* 浮动功德+1 */}
            {floatingTexts.map((text) => (
              <motion.span
                key={text.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -80, scale: 1.2 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute text-xl font-bold text-amber-500 pointer-events-none"
                style={{ left: text.x, top: text.y, textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
              >
                功德+1
              </motion.span>
            ))}
          </motion.button>

          {/* 提示文字 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-rose-400 text-sm"
          >
            点击敲击木鱼，平心静气
          </motion.p>

          {/* 底部提示 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 text-rose-300 text-xs"
          >
            功德每5秒自动保存
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
