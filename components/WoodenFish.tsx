'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMuyuStore } from '@/store/muyuStore';

export default function WoodenFish() {
  const { count, increment } = useMuyuStore();
  const [merits, setMerits] = useState<{ id: number }[]>([]);

  const handleTap = () => {
    increment();
    // Sound playback would go here

    const id = Date.now();
    setMerits((prev) => [...prev, { id }]);
    
    // Cleanup
    setTimeout(() => {
      setMerits((prev) => prev.filter((m) => m.id !== id));
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] relative w-full">
      {/* Counter */}
      <div className="absolute top-0 text-6xl font-thin text-gray-800 dark:text-gray-100 font-sans tracking-tight">
        {count}
      </div>

      {/* Main Interactive Element */}
      <div className="relative mt-20 z-10">
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={handleTap}
          className="cursor-pointer relative"
        >
          {/* SVG Wooden Fish Icon */}
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            <path 
              d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" 
              fill="url(#woodGradient)"
            />
            <path 
              d="M100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170Z" 
              stroke="#5D4037" 
              strokeWidth="4" 
              strokeOpacity="0.3"
            />
            <path 
              d="M30 100H170" 
              stroke="#3E2723" 
              strokeWidth="8" 
              strokeLinecap="round"
            />
             <path 
              d="M140 100C140 122.091 122.091 140 100 140C77.9086 140 60 122.091 60 100" 
              stroke="#3E2723" 
              strokeWidth="8" 
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="woodGradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8D6E63"/>
                <stop offset="1" stopColor="#5D4037"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Floating "+1" Animation */}
        <AnimatePresence>
          {merits.map((merit) => (
            <motion.div
              key={merit.id}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: -100, scale: 1.2 }}
              exit={{ opacity: 0, y: -150 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute left-0 right-0 mx-auto top-0 text-center pointer-events-none whitespace-nowrap"
            >
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                功德 +1
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-16 text-gray-400 text-sm">Tap to accumulate merit</p>
    </div>
  );
}
